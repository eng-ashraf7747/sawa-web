// C:\sawa-web\__tests__\rules\bookings.test.ts

import * as fs from "fs";
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";

let testEnv: RulesTestEnvironment;

const seedBooking = async (overrides = {}) => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().collection("users").doc("admin-uid").set({ role: "admin" });
    await ctx.firestore().collection("bookings").doc("booking-1").set({
      userId: "alice-uid",
      vendorId: "vendor-uid",
      status: "pending",
      orderValue: null,
      commission: 0,
      vendorPoints: 0,
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

describe("bookings/{bookingId} — القراءة", () => {
  it("المستخدم صاحب الحجز يقدر يقراه", async () => {
    await seedBooking();
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertSucceeds(
      alice.firestore().collection("bookings").doc("booking-1").get()
    );
  });

  it("المورد المعنيّ بالحجز يقدر يقراه", async () => {
    await seedBooking();
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertSucceeds(
      vendor.firestore().collection("bookings").doc("booking-1").get()
    );
  });

  it("مستخدم تالت مالوش علاقة بالحجز ممنوع يقراه", async () => {
    await seedBooking();
    const stranger = testEnv.authenticatedContext("stranger-uid", {});
    await assertFails(
      stranger.firestore().collection("bookings").doc("booking-1").get()
    );
  });

  it("الأدمن يقدر يقرا أي حجز", async () => {
    await seedBooking();
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertSucceeds(
      admin.firestore().collection("bookings").doc("booking-1").get()
    );
  });
});

describe("bookings/{bookingId} — الإنشاء", () => {
  it("المستخدم يقدر ينشئ حجز لنفسه بحالة pending", async () => {
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertSucceeds(
      alice.firestore().collection("bookings").doc("booking-2").set({
        userId: "alice-uid",
        vendorId: "vendor-uid",
        status: "pending",
      })
    );
  });

  it("🔴 مستخدم ممنوع ينشئ حجز باسم مستخدم تاني (انتحال)", async () => {
    const attacker = testEnv.authenticatedContext("attacker-uid", {});
    await assertFails(
      attacker.firestore().collection("bookings").doc("booking-3").set({
        userId: "alice-uid",
        vendorId: "vendor-uid",
        status: "pending",
      })
    );
  });

  it("المستخدم ممنوع ينشئ حجز بحالة غير pending مباشرة", async () => {
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertFails(
      alice.firestore().collection("bookings").doc("booking-4").set({
        userId: "alice-uid",
        vendorId: "vendor-uid",
        status: "completed",
      })
    );
  });
});

describe("bookings/{bookingId} — التعديل", () => {
  it("الموَرد يقدر يعدّل حقول التسليم المسموحة (orderValue, status, إلخ)", async () => {
    await seedBooking();
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertSucceeds(
      vendor.firestore().collection("bookings").doc("booking-1").update({
        status: "delivered",
        orderValue: 500,
        commission: 0,
        vendorPoints: 0,
      })
    );
  });

  it("المورد يقدر يلغي حجز بتاعه (نفس صلاحية المستخدم)", async () => {
    await seedBooking();
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertSucceeds(
      vendor.firestore().collection("bookings").doc("booking-1").update({
        status: "cancelled",
        cancellationReason: "الكمية غير متوفرة حالياً",
        cancelledAt: new Date(),
      })
    );
  });

  it("🔴 الموَرد ممنوع يغيّر حقل userId (إعادة تعيين الحجز لمستخدم تاني)", async () => {
    await seedBooking();
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertFails(
      vendor.firestore().collection("bookings").doc("booking-1").update({
        userId: "someone-else-uid",
      })
    );
  });

  it("المستخدم يقدر يعدّل حقول الإتمام/الإلغاء المسموحة", async () => {
    await seedBooking({ status: "delivered" });
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertSucceeds(
      alice.firestore().collection("bookings").doc("booking-1").update({
        status: "completed",
        completedAt: new Date(),
      })
    );
  });

  it("🔴 المستخدم ممنوع يعدّل قيمة الفاتورة (orderValue) بنفسه", async () => {
    await seedBooking({ status: "delivered", orderValue: 500 });
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertFails(
      alice.firestore().collection("bookings").doc("booking-1").update({
        orderValue: 1,
      })
    );
  });

  it("مستخدم تالت مالوش علاقة بالحجز ممنوع يعدّل فيه أي حاجة", async () => {
    await seedBooking();
    const stranger = testEnv.authenticatedContext("stranger-uid", {});
    await assertFails(
      stranger.firestore().collection("bookings").doc("booking-1").update({
        status: "completed",
      })
    );
  });

  it("الأدمن يقدر يعدّل أي حقل في أي حجز", async () => {
    await seedBooking();
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertSucceeds(
      admin.firestore().collection("bookings").doc("booking-1").update({
        status: "cancelled",
        cancellationReason: "طلب الأدمن",
      })
    );
  });
});

describe("bookings/{bookingId} — الحذف", () => {
  it("لا المستخدم ولا المورد يقدروا يحذفوا الحجز", async () => {
    await seedBooking();
    const alice = testEnv.authenticatedContext("alice-uid", {});
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertFails(alice.firestore().collection("bookings").doc("booking-1").delete());
    await assertFails(vendor.firestore().collection("bookings").doc("booking-1").delete());
  });

  it("الأدمن يقدر يحذف الحجز", async () => {
    await seedBooking();
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertSucceeds(
      admin.firestore().collection("bookings").doc("booking-1").delete()
    );
  });
});