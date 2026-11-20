// Copy buttons for citations. Falls back to execCommand because
// navigator.clipboard is unavailable on plain-HTTP pages.
document.addEventListener('click', function (event) {
    var button = event.target;
    if (!button.classList || !button.classList.contains('oss-copy')) return;
    var pre = button.previousElementSibling;
    var label = button.textContent;

    function done(ok) {
        button.textContent = ok ? 'Copied' : 'Select and copy manually';
        setTimeout(function () { button.textContent = label; }, 1500);
    }

    function fallback() {
        var range = document.createRange();
        range.selectNodeContents(pre);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        done(ok);
    }

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(pre.textContent).then(function () { done(true); }, fallback);
    } else {
        fallback();
    }
});
