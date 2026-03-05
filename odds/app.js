document.getElementById("copy")?.addEventListener("click", async () => {
  const v = document.getElementById("ex")?.value || "";
  try {
    await navigator.clipboard.writeText(v);
    alert("예시 배당이 복사됐습니다. DM에 붙여넣어 테스트하세요.");
  } catch {
    alert("복사 실패: 브라우저 권한을 확인하세요.");
  }
});
