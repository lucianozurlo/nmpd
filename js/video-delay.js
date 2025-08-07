var videoDelay = document.getElementById ('loop-massage');
videoDelay.addEventListener ('canplay', function () {
  setTimeout (function () {
    videoDelay.play ();
  }, 111000);
});
