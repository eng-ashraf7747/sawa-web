// C:\sawa-web\__tests__\rules\deals.test.ts

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
  });
};

const seedDeal = async (id: string, overrides = {}) => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().collection("deals").doc(id).set({
      vendorId: "vendor-uid",
      title: "عرض تجريبي",
      status: "active",
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

beforeEach(async () => {
  await seedUsers();
});

describe("deals/{dealId} — القراءة", () => {
  it("صفقة نشطة (active) يقدر يقراها حتى زائر غير مسجَّل دخول", async () => {
    await seedDeal("deal-1", { status: "active" });
    const guest = testEnv.unauthenticatedContext();
    await assertSucceeds(
      guest.firestore().collection("deals").doc("deal-1").get()
    );
  });

  it("زائر غير مسجَّل دخول ممنوع يقرا صفقة معلَّقة (pending)", async () => {
    await seedDeal("deal-2", { status: "pending" });
    const guest = testEnv.unauthenticatedContext();
    await assertFails(
      guest.firestore().collection("deals").doc("deal-2").get()
    );
  });

  it("المورد المالك يقدر يقرا صفقته المعلَّقة", async () => {
    await seedDeal("deal-3", { status: "pending" });
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertSucceeds(
      vendor.firestore().collection("deals").doc("deal-3").get()
    );
  });

  it("مورد تاني ممنوع يقرا صفقة معلَّقة مش بتاعته", async () => {
    await seedDeal("deal-4", { status: "pending" });
    const otherVendor = testEnv.authenticatedContext("other-vendor-uid", {});
    await assertFails(
      otherVendor.firestore().collection("deals").doc("deal-4").get()
    );
  });

  it("الأدمن يقدر يقرا أي صفقة بأي حالة", async () => {
    await seedDeal("deal-5", { status: "draft" });
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertSucceeds(
      admin.firestore().collection("deals").doc("deal-5").get()
    );
  });
});

describe("deals/{dealId} — الإنشاء", () => {
  it("الأدمن يقدر ينشئ صفقة بحالة active مباشرة", async () => {
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertSucceeds(
      admin.firestore().collection("deals").doc("deal-6").set({
        vendorId: "vendor-uid",
        status: "active",
      })
    );
  });

  it("المورد يقدر ينشئ صفقة لنفسه بحالة pending", async () => {
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertSucceeds(
      vendor.firestore().collection("deals").doc("deal-7").set({
        vendorId: "vendor-uid",
        status: "pending",
      })
    );
  });

  it("🔴 المورد ممنوع ينشئ صفقة بحالة active مباشرة (تجاوز موافقة الأدمن)", async () => {
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertFails(
      vendor.firestore().collection("deals").doc("deal-8").set({
        vendorId: "vendor-uid",
        status: "active",
      })
    );
  });

  it("🔴 المورد ممنوع ينشئ صفقة باسم مورد تاني", async () => {
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertFails(
      vendor.firestore().collection("deals").doc("deal-9").set({
        vendorId: "other-vendor-uid",
        status: "pending",
      })
    );
  });
});

describe("deals/{dealId} — التعديل: إعادة الإرسال بعد الرفض/المسودة", () => {
  it("المورد يقدر يعيد إرسال صفقة مرفوضة (rejected → pending)", async () => {
    await seedDeal("deal-10", { status: "rejected" });
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertSucceeds(
      vendor.firestore().collection("deals").doc("deal-10").update({
        status: "pending",
        title: "عرض معدَّل",
      })
    );
  });

  it("المورد يقدر يحوّل مسودة لطلب موافقة (draft → pending)", async () => {
    await seedDeal("deal-11", { status: "draft" });
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertSucceeds(
      vendor.firestore().collection("deals").doc("deal-11").update({
        status: "pending",
      })
    );
  });

  it("🔴 المورد ممنوع يحوّل مسودة لـ active مباشرة (تجاوز الموافقة)", async () => {
    await seedDeal("deal-12", { status: "draft" });
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertFails(
      vendor.firestore().collection("deals").doc("deal-12").update({
        status: "active",
      })
    );
  });
});

describe("deals/{dealId} — التعديل: تعطيل/تفعيل الصفقات المعتمدة", () => {
  it("المورد يقدر يعطّل صفقته النشطة", async () => {
    await seedDeal("deal-13", { status: "active" });
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertSucceeds(
      vendor.firestore().collection("deals").doc("deal-13").update({
        status: "inactive",
      })
    );
  });

  it("المورد يقدر ينشّط صفقته المعطَّلة", async () => {
    await seedDeal("deal-14", { status: "inactive" });
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertSucceeds(
      vendor.firestore().collection("deals").doc("deal-14").update({
        status: "active",
      })
    );
  });

  it("🔴 المورد ممنوع يعدّل العنوان وهو بيعطّل/ينشّط (onlyUpdatingFields)", async () => {
    await seedDeal("deal-15", { status: "active" });
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertFails(
      vendor.firestore().collection("deals").doc("deal-15").update({
        status: "inactive",
        title: "عنوان جديد بدون موافقة",
      })
    );
  });

  it("🔴 مورد تاني ممنوع يعطّل صفقة مش بتاعته", async () => {
    await seedDeal("deal-16", { status: "active" });
    const otherVendor = testEnv.authenticatedContext("other-vendor-uid", {});
    await assertFails(
      otherVendor.firestore().collection("deals").doc("deal-16").update({
        status: "inactive",
      })
    );
  });

  it("الأدمن يقدر يعدّل أي حقل في أي صفقة", async () => {
    await seedDeal("deal-17", { status: "active" });
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertSucceeds(
      admin.firestore().collection("deals").doc("deal-17").update({
        status: "rejected",
        title: "عنوان عدَّله الأدمن",
      })
    );
  });
});

describe("deals/{dealId} — الحذف", () => {
  it("المورد يقدر يحذف صفقة مسودة بتاعته", async () => {
    await seedDeal("deal-18", { status: "draft" });
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertSucceeds(
      vendor.firestore().collection("deals").doc("deal-18").delete()
    );
  });

  it("المورد يقدر يحذف صفقة مرفوضة بتاعته", async () => {
    await seedDeal("deal-19", { status: "rejected" });
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertSucceeds(
      vendor.firestore().collection("deals").doc("deal-19").delete()
    );
  });

  it("🔴 المورد ممنوع يحذف صفقة نشطة بتاعته (لها التزامات محتملة)", async () => {
    await seedDeal("deal-20", { status: "active" });
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertFails(
      vendor.firestore().collection("deals").doc("deal-20").delete()
    );
  });

  it("الأدمن يقدر يحذف أي صفقة بأي حالة", async () => {
    await seedDeal("deal-21", { status: "active" });
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertSucceeds(
      admin.firestore().collection("deals").doc("deal-21").delete()
    );
  });
});