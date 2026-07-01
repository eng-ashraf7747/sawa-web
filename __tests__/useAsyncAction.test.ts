// C:\sawa-web\__tests__\useAsyncAction.test.ts
import { renderHook, act } from "@testing-library/react";
import { useAsyncAction } from "@/hooks/useAsyncAction";

describe("useAsyncAction", () => {

  it("ينفذ الدالة بنجاح ويعيد loading لـ false", async () => {
    const fn = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useAsyncAction());

    expect(result.current.loading).toBe(false);

    await act(async () => {
      await result.current.run(fn);
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("يضبط loading على true أثناء التنفيذ", async () => {
    let resolvePromise: () => void;
    const fn = jest.fn(() => new Promise <void>((resolve) => {
      resolvePromise = resolve;
    }));
    const { result } = renderHook(() => useAsyncAction());

    act(() => {
      result.current.run(fn);
    });

    expect(result.current.loading).toBe(true);
    expect(fn).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolvePromise!();
    });

    expect(result.current.loading).toBe(false);
  });

  it("يمنع التنفيذ المتكرر أثناء التحميل", async () => {
    let resolvePromise: () => void;
    const fn = jest.fn(() => new Promise <void>((resolve) => {
      resolvePromise = resolve;
    }));
    const { result } = renderHook(() => useAsyncAction());

    act(() => { result.current.run(fn); });
    act(() => { result.current.run(fn); });
    act(() => { result.current.run(fn); });

    expect(fn).toHaveBeenCalledTimes(1);

    await act(async () => { resolvePromise!(); });

    expect(result.current.loading).toBe(false);
  });

  it("يسجل الخطأ عند فشل بـ Error", async () => {
    const fn = jest.fn().mockRejectedValue(new Error("فشل الحفظ"));
    const { result } = renderHook(() => useAsyncAction());

    await act(async () => {
      await result.current.run(fn);
    });

    expect(result.current.error).toBe("فشل الحفظ");
    expect(result.current.loading).toBe(false);
  });

  it("يسجل رسالة افتراضية عند خطأ ليس Error", async () => {
    const fn = jest.fn().mockRejectedValue("خطأ نصي");
    const { result } = renderHook(() => useAsyncAction());

    await act(async () => {
      await result.current.run(fn);
    });

    expect(result.current.error).toBe("حدث خطأ غير متوقع");
  });

  it("يسجل رسالة افتراضية عند رفض بـ undefined", async () => {
    const fn = jest.fn().mockRejectedValue(undefined);
    const { result } = renderHook(() => useAsyncAction());

    await act(async () => {
      await result.current.run(fn);
    });

    expect(result.current.error).toBe("حدث خطأ غير متوقع");
  });

  it("يمسح الخطأ عند clearError", async () => {
    const fn = jest.fn().mockRejectedValue(new Error("خطأ"));
    const { result } = renderHook(() => useAsyncAction());

    await act(async () => {
      await result.current.run(fn);
    });

    expect(result.current.error).toBe("خطأ");

    act(() => { result.current.clearError(); });

    expect(result.current.error).toBeNull();
  });

  it("يعيد loading لـ false حتى عند الخطأ", async () => {
    const fn = jest.fn().mockRejectedValue(new Error("خطأ"));
    const { result } = renderHook(() => useAsyncAction());

    await act(async () => {
      await result.current.run(fn);
    });

    expect(result.current.loading).toBe(false);
  });

  it("يسمح بتنفيذ جديد بعد انتهاء الأول", async () => {
    const fn = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useAsyncAction());

    await act(async () => { await result.current.run(fn); });
    await act(async () => { await result.current.run(fn); });

    expect(fn).toHaveBeenCalledTimes(2);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

});