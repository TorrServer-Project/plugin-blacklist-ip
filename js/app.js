'use strict';

function t(key, def) {
    return (typeof i18n !== 'undefined' && i18n.t) ? i18n.t(key, def) : key;
}

function showToast(msg, type) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(function() { el.classList.remove('show'); }, 2500);
}

function modalConfirm(title, text) {
    return new Promise(function(resolve) {
        var overlay = document.getElementById('confirm-overlay');
        var okBtn = document.getElementById('confirm-ok');
        var cancelBtn = document.getElementById('confirm-cancel');
        var xBtn = document.getElementById('confirm-x');

        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-text').textContent = text;
        overlay.style.display = 'flex';

        function done(val) {
            overlay.style.display = 'none';
            okBtn.removeEventListener('click', onOk);
            cancelBtn.removeEventListener('click', onCancel);
            xBtn.removeEventListener('click', onCancel);
            overlay.removeEventListener('click', onBack);
            document.removeEventListener('keydown', onKey);
            resolve(val);
        }
        function onOk() { done(true); }
        function onCancel() { done(false); }
        function onBack(e) { if (e.target === overlay) done(false); }
        function onKey(e) { if (e.key === 'Escape') done(false); }

        okBtn.addEventListener('click', onOk);
        cancelBtn.addEventListener('click', onCancel);
        xBtn.addEventListener('click', onCancel);
        overlay.addEventListener('click', onBack);
        document.addEventListener('keydown', onKey);
    });
}

var DEFAULT_BLOCKLIST =
    "# IP blocklist\n" +
    "# One entry per line. Lines starting with # are comments.\n" +
    "#\n" +
    "# Supported formats:\n" +
    "#   1.2.3.4\n" +
    "#   1.2.3.0 - 1.2.3.255\n" +
    "#   1.2.3.4 - 1.2.3.255 , 000 , comment\n" +
    "#\n" +
    "# Empty lines are ignored. The whole list is applied to the torrent engine\n" +
    "# on save. Peers from listed ranges will not be contacted.";

function loadConfig() {
    fetch('api/config')
        .then(function(r) { return r.json(); })
        .then(function(d) {
            document.getElementById('blocklist').value = d.blocklist || '';
        })
        .catch(function(e) { showToast(e.message, 'error'); });
}

function saveConfig() {
    var text = document.getElementById('blocklist').value;
    var btn = document.getElementById('btn-save');
    btn.disabled = true;

    fetch('api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocklist: text })
    })
        .then(function(r) { return r.json(); })
        .then(function(d) {
            if (d.status === 'ok') {
                showToast(t('plugin.blacklist-ip.saved', 'Saved'), 'success');
            } else {
                showToast(d.error || 'error', 'error');
            }
        })
        .catch(function(e) { showToast(e.message, 'error'); })
        .finally(function() { btn.disabled = false; });
}

function resetConfig() {
    modalConfirm(
        t('plugin.blacklist-ip.reset_title', 'Clear blocklist'),
        t('plugin.blacklist-ip.confirm_reset', 'Clear the blocklist?')
    ).then(function(ok) {
        if (!ok) return;
        fetch('api/reset', { method: 'POST' })
            .then(function(r) { return r.json(); })
            .then(function(d) {
                if (d.status === 'ok') {
                    document.getElementById('blocklist').value = '';
                    showToast(t('plugin.blacklist-ip.reset_done', 'Cleared'), 'success');
                } else {
                    showToast(d.error || 'error', 'error');
                }
            })
            .catch(function(e) { showToast(e.message, 'error'); });
    });
}

function insertTemplate() {
    var ta = document.getElementById('blocklist');
    if (ta.value.trim() === '') {
        ta.value = DEFAULT_BLOCKLIST;
        return;
    }
    modalConfirm(
        t('plugin.blacklist-ip.template_title', 'Replace list'),
        t('plugin.blacklist-ip.confirm_template', 'Replace current list with template?')
    ).then(function(ok) {
        if (ok) ta.value = DEFAULT_BLOCKLIST;
    });
}

document.getElementById('btn-save').addEventListener('click', saveConfig);
document.getElementById('btn-reset').addEventListener('click', resetConfig);
document.getElementById('btn-default').addEventListener('click', insertTemplate);

if (typeof i18n !== 'undefined' && i18n.apply) i18n.apply();
loadConfig();
