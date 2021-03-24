export function goToAnchor(id: string) {
  return () => {
    const anchor = document.getElementById(id);

    if (anchor) {
      window.scrollTo({ top: anchor.offsetTop - 60 });
    }
  };
}
