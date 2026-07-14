// C:\sawa-web\__tests__\rules\storage.test.ts

import * as fs from "fs";
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import { ref, uploadBytes, getBytes, deleteObject } from "firebase/storage";

let testEnv: RulesTestEnvironment;

const seedUsers = async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().collection("users").doc("admin-uid").set({ role: "admin" });
    await ctx.firestore().collection("users").doc("vendor-uid").set({ role: "vendor" });
    await ctx.firestore().collection("users").doc("other-vendor-uid").set({ role: "vendor" });
    await ctx.firestore().collection("users").doc("alice-uid").set({ role: "user" });
  });
};

const seedFile = async (path: string, contentType = "image/jpeg", sizeBytes = 2000) => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const storageRef = ref(ctx.storage(), path);
    const buffer = Buffer.alloc(sizeBytes, 1);
    await uploadBytes(storageRef, buffer, { contentType });
  });
};

const fakeImage = (sizeBytes = 2000) => Buffer.alloc(sizeBytes, 1);

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "sawa-web-rules-test",
    firestore: {
      rules: fs.readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
    storage: {
      rules: fs.readFileSync("storage.rules", "utf8"),
      host: "127.0.0.1",
      port: 9199,
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
// profile-images/{userId}/{fileName}
// المسار الحقيقي المستخدم في useUpdateProfile.ts
// ═══════════════════════════════════════
describe("profile-images/{userId}/{fileName} — القراءة", () => {
  it("أي حد (حتى زائر غير مسجَّل) يقدر يقرا صورة بروفايل", async () => {
    await seedFile("profile-images/vendor-uid/read-1.jpg");
    const guest = testEnv.unauthenticatedContext();
    await assertSucceeds(getBytes(ref(guest.storage(), "profile-images/vendor-uid/read-1.jpg")));
  });
});

describe("profile-images/{userId}/{fileName} — الإنشاء", () => {
  it("المالك يقدر يرفع صورة بروفايل صحيحة", async () => {
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertSucceeds(
      uploadBytes(ref(alice.storage(), "profile-images/alice-uid/create-1.jpg"), fakeImage(2000), {
        contentType: "image/jpeg",
      })
    );
  });

  it("🔴 المالك ممنوع يرفع ملف بنوع غير مسموح (مثلاً PDF)", async () => {
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertFails(
      uploadBytes(ref(alice.storage(), "profile-images/alice-uid/create-2.pdf"), fakeImage(2000), {
        contentType: "application/pdf",
      })
    );
  });

  it("🔴 المالك ممنوع يرفع ملف أكبر من 8 ميجا", async () => {
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertFails(
      uploadBytes(
        ref(alice.storage(), "profile-images/alice-uid/create-3.jpg"),
        fakeImage(9 * 1024 * 1024),
        { contentType: "image/jpeg" }
      )
    );
  });

  it("🔴 المالك ممنوع يرفع ملف أصغر من 1 كيلوبايت", async () => {
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertFails(
      uploadBytes(ref(alice.storage(), "profile-images/alice-uid/create-4.jpg"), fakeImage(500), {
        contentType: "image/jpeg",
      })
    );
  });

  it("🔴 مستخدم ممنوع يرفع صورة بروفايل في مجلد مستخدم تاني", async () => {
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertFails(
      uploadBytes(ref(alice.storage(), "profile-images/vendor-uid/create-5.jpg"), fakeImage(2000), {
        contentType: "image/jpeg",
      })
    );
  });

  it("🔴 زائر غير مسجَّل دخول ممنوع يرفع صورة بروفايل", async () => {
    const guest = testEnv.unauthenticatedContext();
    await assertFails(
      uploadBytes(ref(guest.storage(), "profile-images/vendor-uid/create-6.jpg"), fakeImage(2000), {
        contentType: "image/jpeg",
      })
    );
  });
});

describe("profile-images/{userId}/{fileName} — التعديل والحذف", () => {
  it("المالك يقدر يستبدل صورة بروفايله بصورة جديدة", async () => {
    await seedFile("profile-images/vendor-uid/update-1.jpg");
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertSucceeds(
      uploadBytes(ref(vendor.storage(), "profile-images/vendor-uid/update-1.jpg"), fakeImage(3000), {
        contentType: "image/jpeg",
      })
    );
  });

  it("المالك يقدر يحذف صورة بروفايله", async () => {
    await seedFile("profile-images/vendor-uid/delete-1.jpg");
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertSucceeds(deleteObject(ref(vendor.storage(), "profile-images/vendor-uid/delete-1.jpg")));
  });

  it("الأدمن يقدر يحذف صورة بروفايل أي حد", async () => {
    await seedFile("profile-images/vendor-uid/delete-2.jpg");
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertSucceeds(deleteObject(ref(admin.storage(), "profile-images/vendor-uid/delete-2.jpg")));
  });

  it("🔴 مستخدم تاني ممنوع يحذف صورة بروفايل مش بتاعته", async () => {
    await seedFile("profile-images/vendor-uid/delete-3.jpg");
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertFails(deleteObject(ref(alice.storage(), "profile-images/vendor-uid/delete-3.jpg")));
  });
});

// ═══════════════════════════════════════
// deals/{fileName}
// المسار الحقيقي المستخدم في ImageUpload.tsx (بدون vendorId في المسار)
// ═══════════════════════════════════════
describe("deals/{fileName} — القراءة", () => {
  it("أي حد (حتى زائر غير مسجَّل) يقدر يقرا صورة صفقة", async () => {
    await seedFile("deals/read-1.jpg");
    const guest = testEnv.unauthenticatedContext();
    await assertSucceeds(getBytes(ref(guest.storage(), "deals/read-1.jpg")));
  });
});

describe("deals/{fileName} — الإنشاء", () => {
  it("المورد يقدر يرفع صورة صفقة", async () => {
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertSucceeds(
      uploadBytes(ref(vendor.storage(), "deals/create-1.jpg"), fakeImage(2000), {
        contentType: "image/jpeg",
      })
    );
  });

  it("الأدمن يقدر يرفع صورة صفقة", async () => {
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertSucceeds(
      uploadBytes(ref(admin.storage(), "deals/create-2.jpg"), fakeImage(2000), {
        contentType: "image/jpeg",
      })
    );
  });

  it("🔴 مستخدم عادي (ليس مورد ولا أدمن) ممنوع يرفع صورة صفقة", async () => {
    const alice = testEnv.authenticatedContext("alice-uid", {});
    await assertFails(
      uploadBytes(ref(alice.storage(), "deals/create-3.jpg"), fakeImage(2000), {
        contentType: "image/jpeg",
      })
    );
  });

  it("🔴 زائر غير مسجَّل دخول ممنوع يرفع صورة صفقة", async () => {
    const guest = testEnv.unauthenticatedContext();
    await assertFails(
      uploadBytes(ref(guest.storage(), "deals/create-4.jpg"), fakeImage(2000), {
        contentType: "image/jpeg",
      })
    );
  });

  it("🔴 ممنوع رفع ملف بنوع غير مسموح حتى من مورد", async () => {
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertFails(
      uploadBytes(ref(vendor.storage(), "deals/create-5.pdf"), fakeImage(2000), {
        contentType: "application/pdf",
      })
    );
  });
});

describe("deals/{fileName} — التعديل والحذف", () => {
  it("أي مورد يقدر يستبدل صورة صفقة موجودة (حماية عامة، ليست ملكية دقيقة)", async () => {
    await seedFile("deals/update-1.jpg");
    const otherVendor = testEnv.authenticatedContext("other-vendor-uid", {});
    await assertSucceeds(
      uploadBytes(ref(otherVendor.storage(), "deals/update-1.jpg"), fakeImage(3000), {
        contentType: "image/jpeg",
      })
    );
  });

  it("الأدمن يقدر يحذف صورة صفقة", async () => {
    await seedFile("deals/delete-1.jpg");
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertSucceeds(deleteObject(ref(admin.storage(), "deals/delete-1.jpg")));
  });

  it("🔴 المورد ممنوع يحذف صورة صفقة (الحذف للأدمن فقط)", async () => {
    await seedFile("deals/delete-2.jpg");
    const vendor = testEnv.authenticatedContext("vendor-uid", {});
    await assertFails(deleteObject(ref(vendor.storage(), "deals/delete-2.jpg")));
  });
});

// ═══════════════════════════════════════
// أي مسار خارج المسارين المعروفين
// ═══════════════════════════════════════
describe("أي مسار خارج profile-images/ وdeals/ — يُمنع بالكامل", () => {
  it("🔴 ممنوع القراءة من أي مسار غير معروف", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const buffer = Buffer.alloc(2000, 1);
      await uploadBytes(ref(ctx.storage(), "other/some-file.jpg"), buffer, {
        contentType: "image/jpeg",
      });
    });
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertFails(getBytes(ref(admin.storage(), "other/some-file.jpg")));
  });

  it("🔴 ممنوع الكتابة في أي مسار غير معروف (حتى للأدمن)", async () => {
    const admin = testEnv.authenticatedContext("admin-uid", {});
    await assertFails(
      uploadBytes(ref(admin.storage(), "other/new-file.jpg"), fakeImage(2000), {
        contentType: "image/jpeg",
      })
    );
  });
});