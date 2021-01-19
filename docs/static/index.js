const INITIAL_ROTATION = 12
const COLLAPSE_END_THRESHOLD = 400

window.onload = () => {
  const topDiagonal = document.querySelector("#top-diagonal")

  // "collapse" animation when scrolling the page
  window.addEventListener("scroll", function () {
    const rotation =
      INITIAL_ROTATION -
      (window.scrollY / COLLAPSE_END_THRESHOLD) * INITIAL_ROTATION
    console.log(rotation)

    requestAnimationFrame(
      () =>
        (topDiagonal.style.transform = `rotate(-${
          rotation < 0 ? 0 : rotation
        }deg)`)
    )
  })
}
