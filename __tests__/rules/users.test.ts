// C:\sawa-web\__tests__\rules\users.test.ts

import * as fs from "fs";
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";

let testEnv: RulesTestEnvironment;

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

describe("users/{userId} — القراءة", () => {
  it("المستخدم يقدر يقرا مستنده الخاص", async () => {
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection("users").doc("alice-uid").set({ role: "user" });
    });

    await assertSucceeds(
      alice.firestore().collection("users").doc("alice-uid").get()
    );
  });

  it("المستخدم ممنوع يقرا مستند مستخدم تاني", async () => {
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection("users").doc("bob-uid").set({ role: "user" });
    });

    await assertFails(
      alice.firestore().collection("users").doc("bob-uid").get()
    );
  });

  it("الأدمن يقدر يقرا مستند أي مستخدم", async () => {
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection("users").doc("admin-uid").set({ role: "admin" });
      await ctx.firestore().collection("users").doc("bob-uid").set({ role: "user" });
    });

    await assertSucceeds(
      admin.firestore().collection("users").doc("bob-uid").get()
    );
  });
});

describe("users/{userId} — الإنشاء", () => {
  it("مستخدم جديد يقدر يسجّل نفسه بدور 'user'", async () => {
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertSucceeds(
      alice.firestore().collection("users").doc("alice-uid").set({ role: "user" })
    );
  });

  it("مستخدم ممنوع يسجّل نفسه بدور 'admin' مباشرة (منع تحايل التسجيل)", async () => {
    const attacker = testEnv.authenticatedContext("attacker-uid", {});
    await assertFails(
      attacker.firestore().collection("users").doc("attacker-uid").set({ role: "admin" })
    );
  });

  it("مستخدم ممنوع ينشئ مستند باسم حد تاني", async () => {
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertFails(
      alice.firestore().collection("users").doc("bob-uid").set({ role: "user" })
    );
  });
});

describe("users/{userId} — التعديل (الاختبار الأهم في كل المشروع)", () => {
  it("المستخدم يقدر يعدّل بياناته العادية (مثال: الاسم)", async () => {
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection("users").doc("alice-uid")
        .set({ role: "user", displayName: "أليس" });
    });

    await assertSucceeds(
      alice.firestore().collection("users").doc("alice-uid")
        .update({ displayName: "أليس المعدَّلة" })
    );
  });

  it("🔴 مستخدم عادي ممنوع يرقّي نفسه لأدمن (الفجوة الحرجة من المهمة 1)", async () => {
    const attacker = testEnv.authenticatedContext("attacker-uid", {});
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection("users").doc("attacker-uid")
        .set({ role: "user", displayName: "مستخدم عادي" });
    });

    await assertFails(
      attacker.firestore().collection("users").doc("attacker-uid")
        .update({ role: "admin" })
    );
  });

  it("الأدمن يقدر يغيّر دور مستخدم تاني (تحويله لمورد)", async () => {
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection("users").doc("admin-uid").set({ role: "admin" });
      await ctx.firestore().collection("users").doc("bob-uid").set({ role: "user" });
    });

    await assertSucceeds(
      admin.firestore().collection("users").doc("bob-uid")
        .update({ role: "vendor" })
    );
  });
});

describe("users/{userId} — الحذف", () => {
  it("لا يمكن لأي أحد (حتى الأدمن) حذف مستند مستخدم عبر التطبيق", async () => {
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection("users").doc("admin-uid").set({ role: "admin" });
      await ctx.firestore().collection("users").doc("bob-uid").set({ role: "user" });
    });

    await assertFails(
      admin.firestore().collection("users").doc("bob-uid").delete()
    );
  });
});