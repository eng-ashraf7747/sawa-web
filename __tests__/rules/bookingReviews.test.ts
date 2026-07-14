// C:\sawa-web\__tests__\rules\bookingReviews.test.ts

import * as fs from "fs";
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";

let testEnv: RulesTestEnvironment;

const seedReview = async (overrides = {}) => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().collection("users").doc("admin-uid").set({ role: "admin" });
    await ctx.firestore().collection("bookingReviews").doc("review-1").set({
      bookingId: "booking-1",
      userId: "alice-uid",
      targetId: "vendor-uid",
      type: "user_to_vendor",
      rating: 5,
      comment: "ممتاز",
      approved: false,
      ...overrides,
    });
  });
};

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "sawa-web-rules-test",
    firestore: {
      rules: fs.readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

describe("bookingReviews/{reviewId} — القراءة", () => {
  it("أي مستخدم مسجَّل دخول يقدر يقرا أي تقييم (لحساب المتوسطات)", async () => {
    await seedReview();
    const bob = testEnv.authenticatedContext("bob-uid", {});
    await assertSucceeds(
      bob.firestore().collection("bookingReviews").doc("review-1").get()
    );
  });

  it("زائر غير مسجَّل دخول ممنوع يقرا أي تقييم", async () => {
    await seedReview();
    const guest = testEnv.unauthenticatedContext();
    await assertFails(
      guest.firestore().collection("bookingReviews").doc("review-1").get()
    );
  });
});

describe("bookingReviews/{reviewId} — الإنشاء", () => {
  it("المستخدم يقدر يسجّل تقييم لنفسه برقم صحيح (1-5)", async () => {
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertSucceeds(
      alice.firestore().collection("bookingReviews").doc("review-2").set({
        bookingId: "booking-2",
        userId: "alice-uid",
        targetId: "vendor-uid",
        type: "user_to_vendor",
        rating: 4,
        comment: null,
        approved: false,
      })
    );
  });

  it("🔴 مستخدم ممنوع يسجّل تقييم باسم مستخدم تاني (انتحال)", async () => {
    const attacker = testEnv.authenticatedContext("attacker-uid", {});
    await assertFails(
      attacker.firestore().collection("bookingReviews").doc("review-3").set({
        bookingId: "booking-3",
        userId: "alice-uid",
        targetId: "vendor-uid",
        type: "user_to_vendor",
        rating: 5,
        approved: false,
      })
    );
  });

  it("🔴 ممنوع تسجيل تقييم برقم أكبر من 5", async () => {
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertFails(
      alice.firestore().collection("bookingReviews").doc("review-4").set({
        bookingId: "booking-4",
        userId: "alice-uid",
        targetId: "vendor-uid",
        type: "user_to_vendor",
        rating: 6,
        approved: false,
      })
    );
  });

  it("🔴 ممنوع تسجيل تقييم برقم أقل من 1", async () => {
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertFails(
      alice.firestore().collection("bookingReviews").doc("review-5").set({
        bookingId: "booking-5",
        userId: "alice-uid",
        targetId: "vendor-uid",
        type: "user_to_vendor",
        rating: 0,
        approved: false,
      })
    );
  });

  it("🔴 ممنوع تسجيل تقييم بـ approved=true مباشرة (تجاوز نظام الاعتماد)", async () => {
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertFails(
      alice.firestore().collection("bookingReviews").doc("review-6").set({
        bookingId: "booking-6",
        userId: "alice-uid",
        targetId: "vendor-uid",
        type: "user_to_vendor",
        rating: 5,
        approved: true,
      })
    );
  });
});

describe("bookingReviews/{reviewId} — التعديل (ممنوع تماماً حتى للأدمن)", () => {
  it("🔴 صاحب التقييم نفسه ممنوع يعدّله بعد الإرسال", async () => {
    await seedReview();
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertFails(
      alice.firestore().collection("bookingReviews").doc("review-1").update({
        rating: 1,
      })
    );
  });

  it("🔴 حتى الأدمن ممنوع يعدّل تقييم موجود (القاعدة مطلقة: if false)", async () => {
    await seedReview();
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertFails(
      admin.firestore().collection("bookingReviews").doc("review-1").update({
        approved: true,
      })
    );
  });
});

describe("bookingReviews/{reviewId} — الحذف", () => {
  it("المستخدم العادي ممنوع يحذف أي تقييم", async () => {
    await seedReview();
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertFails(
      alice.firestore().collection("bookingReviews").doc("review-1").delete()
    );
  });

  it("الأدمن يقدر يحذف تقييم", async () => {
    await seedReview();
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertSucceeds(
      admin.firestore().collection("bookingReviews").doc("review-1").delete()
    );
  });
});