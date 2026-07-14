// C:\sawa-web\__tests__\rules\remaining.test.ts

import * as fs from "fs";
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";

let testEnv: RulesTestEnvironment;

const seedUsers = async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().collection("users").doc("admin-uid").set({ role: "admin" });
    await ctx.firestore().collection("users").doc("vendor-uid").set({ role: "vendor" });
    await ctx.firestore().collection("users").doc("alice-uid").set({ role: "user" });
  });
};

const seedDoc = async (path: string, id: string, data: object) => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().collection(path).doc(id).set(data);
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

beforeEach(async () => {
  await seedUsers();
});

// ═══════════════════════════════════════
// 5) categories/{categoryId}
// ═══════════════════════════════════════
describe("categories/{categoryId}", () => {
  it("أي حد (حتى زائر) يقدر يقرا الفئات", async () => {
    await seedDoc("categories", "cat-1", { name: "رياضة" });
    const guest = testEnv.unauthenticatedContext();
    await assertSucceeds(guest.firestore().collection("categories").doc("cat-1").get());
  });

  it("🔴 المورد ممنوع ينشئ فئة", async () => {
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertFails(
      vendor.firestore().collection("categories").doc("cat-2").set({ name: "فئة جديدة" })
    );
  });

  it("الأدمن يقدر ينشئ فئة", async () => {
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertSucceeds(
      admin.firestore().collection("categories").doc("cat-3").set({ name: "فئة جديدة" })
    );
  });

  it("الأدمن يقدر يحذف فئة", async () => {
    await seedDoc("categories", "cat-4", { name: "فئة للحذف" });
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertSucceeds(admin.firestore().collection("categories").doc("cat-4").delete());
  });
});

// ═══════════════════════════════════════
// 6) commission_ledger/{entryId}
// ═══════════════════════════════════════
describe("commission_ledger/{entryId}", () => {
  it("المورد المعنيّ يقدر يقرا قيد عمولته", async () => {
    await seedDoc("commission_ledger", "entry-1", { vendorId: "vendor-uid", invoiceValue: 500 });
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertSucceeds(vendor.firestore().collection("commission_ledger").doc("entry-1").get());
  });

  it("🔴 مورد تاني ممنوع يقرا قيد عمولة مش بتاعته", async () => {
    await seedDoc("commission_ledger", "entry-2", { vendorId: "vendor-uid", invoiceValue: 500 });
    const otherVendor = testEnv.authenticatedContext("other-vendor-uid", {});
    await assertFails(otherVendor.firestore().collection("commission_ledger").doc("entry-2").get());
  });

  it("المورد يقدر ينشئ قيد عمولة لنفسه", async () => {
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertSucceeds(
      vendor.firestore().collection("commission_ledger").doc("entry-3").set({
        vendorId: "vendor-uid",
        invoiceValue: 500,
      })
    );
  });

  it("🔴 المورد ممنوع يعدّل قيد عمولة (حتى بتاعه) - الأدمن بس", async () => {
    await seedDoc("commission_ledger", "entry-4", { vendorId: "vendor-uid", status: "pending" });
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertFails(
      vendor.firestore().collection("commission_ledger").doc("entry-4").update({ status: "paid" })
    );
  });

  it("الأدمن يقدر يعدّل حالة الدفع", async () => {
    await seedDoc("commission_ledger", "entry-5", { vendorId: "vendor-uid", status: "pending" });
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertSucceeds(
      admin.firestore().collection("commission_ledger").doc("entry-5").update({ status: "paid" })
    );
  });

  it("🔴 لا أحد (حتى الأدمن) يقدر يحذف قيد عمولة", async () => {
    await seedDoc("commission_ledger", "entry-6", { vendorId: "vendor-uid" });
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertFails(admin.firestore().collection("commission_ledger").doc("entry-6").delete());
  });
});

// ═══════════════════════════════════════
// 7) contact_messages/{messageId}
// ═══════════════════════════════════════
describe("contact_messages/{messageId}", () => {
  it("صاحب الرسالة يقدر يقراها", async () => {
    await seedDoc("contact_messages", "msg-1", { userId: "alice-uid", message: "استفسار" });
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertSucceeds(alice.firestore().collection("contact_messages").doc("msg-1").get());
  });

  it("🔴 مستخدم تاني ممنوع يقرا رسالة مش بتاعته", async () => {
    await seedDoc("contact_messages", "msg-2", { userId: "alice-uid", message: "استفسار" });
    const bob = testEnv.authenticatedContext("bob-uid", {});
    await assertFails(bob.firestore().collection("contact_messages").doc("msg-2").get());
  });

  it("أي مستخدم مسجَّل يقدر يبعت رسالة", async () => {
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertSucceeds(
      alice.firestore().collection("contact_messages").doc("msg-3").set({
        userId: "alice-uid",
        message: "استفسار جديد",
      })
    );
  });

  it("🔴 زائر غير مسجَّل دخول ممنوع يبعت رسالة", async () => {
    const guest = testEnv.unauthenticatedContext();
    await assertFails(
      guest.firestore().collection("contact_messages").doc("msg-4").set({
        message: "رسالة من زائر",
      })
    );
  });

  it("الأدمن يقدر يرد (يعدّل) على رسالة", async () => {
    await seedDoc("contact_messages", "msg-5", { userId: "alice-uid", status: "open" });
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertSucceeds(
      admin.firestore().collection("contact_messages").doc("msg-5").update({ status: "closed" })
    );
  });

  it("🔴 المستخدم ممنوع يبعت رسالة تانية في نفس اليوم", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection("users").doc("alice-uid").update({
        lastContactMessageAt: new Date(),
      });
    });
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertFails(
      alice.firestore().collection("contact_messages").doc("msg-6").set({
        userId: "alice-uid",
        message: "رسالة ثانية في نفس اليوم",
      })
    );
  });

  it("المستخدم يقدر يبعت رسالة تانية بعد مرور أكتر من 24 ساعة", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      await ctx.firestore().collection("users").doc("alice-uid").update({
        lastContactMessageAt: twoDaysAgo,
      });
    });
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertSucceeds(
      alice.firestore().collection("contact_messages").doc("msg-7").set({
        userId: "alice-uid",
        message: "رسالة بعد يومين",
      })
    );
  });

  it("مستخدم لم يبعث أي رسالة من قبل يقدر يبعت أول رسالة بدون قيد", async () => {
    const bob = testEnv.authenticatedContext("bob-uid", {});
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection("users").doc("bob-uid").set({ role: "user" });
    });
    await assertSucceeds(
      bob.firestore().collection("contact_messages").doc("msg-8").set({
        userId: "bob-uid",
        message: "أول رسالة لهذا المستخدم",
      })
    );
  });
});

// ═══════════════════════════════════════
// 8) requests/{requestId}
// ═══════════════════════════════════════
describe("requests/{requestId}", () => {
  it("صاحب الطلب يقدر يقراه", async () => {
    await seedDoc("requests", "req-1", { userId: "alice-uid" });
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertSucceeds(alice.firestore().collection("requests").doc("req-1").get());
  });

  it("المستخدم يقدر ينشئ طلب لنفسه", async () => {
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertSucceeds(
      alice.firestore().collection("requests").doc("req-2").set({ userId: "alice-uid" })
    );
  });

  it("🔴 المستخدم ممنوع ينشئ طلب باسم حد تاني", async () => {
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertFails(
      alice.firestore().collection("requests").doc("req-3").set({ userId: "bob-uid" })
    );
  });

  it("🔴 المستخدم ممنوع يوافق/يرفض طلبه بنفسه", async () => {
    await seedDoc("requests", "req-4", { userId: "alice-uid", status: "pending" });
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertFails(
      alice.firestore().collection("requests").doc("req-4").update({ status: "approved" })
    );
  });

  it("الأدمن يقدر يوافق على طلب", async () => {
    await seedDoc("requests", "req-5", { userId: "alice-uid", status: "pending" });
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertSucceeds(
      admin.firestore().collection("requests").doc("req-5").update({ status: "approved" })
    );
  });
});

// ═══════════════════════════════════════
// 9) vendorProfiles/{vendorId}
// ═══════════════════════════════════════
describe("vendorProfiles/{vendorId}", () => {
  it("أي حد (حتى زائر) يقدر يقرا ملف المورد", async () => {
    await seedDoc("vendorProfiles", "vendor-uid", { businessName: "متجر تجريبي" });
    const guest = testEnv.unauthenticatedContext();
    await assertSucceeds(guest.firestore().collection("vendorProfiles").doc("vendor-uid").get());
  });

  it("المورد يقدر ينشئ ملفه الخاص", async () => {
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertSucceeds(
      vendor.firestore().collection("vendorProfiles").doc("vendor-uid").set({
        businessName: "متجري",
      })
    );
  });

  it("🔴 مورد ممنوع ينشئ ملف باسم مورد تاني", async () => {
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertFails(
      vendor.firestore().collection("vendorProfiles").doc("other-vendor-uid").set({
        businessName: "انتحال",
      })
    );
  });

  it("المورد يقدر يعدّل ملفه بنفسه", async () => {
    await seedDoc("vendorProfiles", "vendor-uid", { businessName: "قديم" });
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertSucceeds(
      vendor.firestore().collection("vendorProfiles").doc("vendor-uid").update({
        businessName: "محدَّث",
      })
    );
  });

  it("🔴 مستخدم عادي ممنوع يعدّل ملف مورد", async () => {
    await seedDoc("vendorProfiles", "vendor-uid", { businessName: "قديم" });
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertFails(
      alice.firestore().collection("vendorProfiles").doc("vendor-uid").update({
        businessName: "تلاعب",
      })
    );
  });
});

// ═══════════════════════════════════════
// 10) analytics_events/{eventId}
// ═══════════════════════════════════════
describe("analytics_events/{eventId}", () => {
  it("أي حد (حتى زائر) يقدر يسجّل حدث تتبع", async () => {
    const guest = testEnv.unauthenticatedContext();
    await assertSucceeds(
      guest.firestore().collection("analytics_events").doc("event-1").set({
        eventType: "offer_viewed",
      })
    );
  });

  it("🔴 مستخدم عادي ممنوع يقرا الأحداث", async () => {
    await seedDoc("analytics_events", "event-2", { eventType: "offer_viewed" });
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertFails(alice.firestore().collection("analytics_events").doc("event-2").get());
  });

  it("الأدمن يقدر يقرا الأحداث", async () => {
    await seedDoc("analytics_events", "event-3", { eventType: "offer_viewed" });
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertSucceeds(admin.firestore().collection("analytics_events").doc("event-3").get());
  });

  it("🔴 لا أحد يقدر يعدّل حدث بعد تسجيله", async () => {
    await seedDoc("analytics_events", "event-4", { eventType: "offer_viewed" });
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertFails(
      admin.firestore().collection("analytics_events").doc("event-4").update({ eventType: "x" })
    );
  });
});

// ═══════════════════════════════════════
// 11) subcategoryStats/{subcategoryId}
// ═══════════════════════════════════════
describe("subcategoryStats/{subcategoryId}", () => {
  it("أي حد يقدر يقرا إحصائيات الفئة الفرعية", async () => {
    await seedDoc("subcategoryStats", "sub-1", { interestedCount: 5 });
    const guest = testEnv.unauthenticatedContext();
    await assertSucceeds(guest.firestore().collection("subcategoryStats").doc("sub-1").get());
  });

  it("مستخدم مسجَّل يقدر يزوّد عدّاد الاهتمام", async () => {
    await seedDoc("subcategoryStats", "sub-2", { interestedCount: 5 });
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertSucceeds(
      alice.firestore().collection("subcategoryStats").doc("sub-2").update({
        interestedCount: 6,
      })
    );
  });

  it("🔴 ممنوع تعديل أي حقل غير interestedCount", async () => {
    await seedDoc("subcategoryStats", "sub-3", { interestedCount: 5 });
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertFails(
      alice.firestore().collection("subcategoryStats").doc("sub-3").update({
        interestedCount: 6,
        name: "اسم متلاعَب به",
      })
    );
  });

  it("🔴 ممنوع إنشاء مستند جديد في هذه المجموعة عبر التطبيق", async () => {
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertFails(
      alice.firestore().collection("subcategoryStats").doc("sub-4").set({
        interestedCount: 1,
      })
    );
  });
});