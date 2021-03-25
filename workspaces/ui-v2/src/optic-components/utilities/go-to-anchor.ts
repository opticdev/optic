export function goToAnchor(id: string) {
  return () => {
    const anchor = document.getElementById(id);
    if (anchor) {
      const parent = document.getElementById('right-pane') || window;
      parent.scrollTo({ top: anchor.offsetTop - 60 });
    }
  };
}
