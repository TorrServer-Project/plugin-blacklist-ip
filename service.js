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

var currentBlocklist = "";

function applyBlocklist(text) {
    ts.torrent.setBlocklist(text);
}

(function loadConfig() {
    var saved = ts.storage.get("blocklist");
    if (typeof saved !== "string") {
        currentBlocklist = "";
        console.log("[IP Blocklist] No saved blocklist, starting empty");
        return;
    }
    currentBlocklist = saved;
    try {
        applyBlocklist(currentBlocklist);
        console.log("[IP Blocklist] Loaded saved blocklist");
    } catch (e) {
        console.error("[IP Blocklist] Saved blocklist is invalid, resetting");
        currentBlocklist = "";
        ts.storage.set("blocklist", "");
        try { applyBlocklist(""); } catch (e2) {}
    }
})();

function requireOwner(req, res) {
    if (!req.user || req.user.rank < 100) {
        res.status(403).json({ error: "forbidden" });
        return false;
    }
    return true;
}

ts.web.get("/api/config", function(req, res) {
    if (!requireOwner(req, res)) return;
    return res.json({ blocklist: currentBlocklist });
});

ts.web.post("/api/save", function(req, res) {
    if (!requireOwner(req, res)) return;

    var body = req.body;
    if (typeof body === "string") {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    if (!body || typeof body !== "object") body = {};

    var text = String(body.blocklist || "");

    try {
        applyBlocklist(text);
    } catch (e) {
        return res.status(400).json({ error: String(e) });
    }

    currentBlocklist = text;
    ts.storage.set("blocklist", text);
    console.log("[IP Blocklist] Saved and applied");
    return res.json({ status: "ok" });
});

ts.web.post("/api/reset", function(req, res) {
    if (!requireOwner(req, res)) return;

    try {
        applyBlocklist("");
    } catch (e) {
        return res.status(400).json({ error: String(e) });
    }

    currentBlocklist = "";
    ts.storage.rem("blocklist");
    console.log("[IP Blocklist] Reset to empty");
    return res.json({ status: "ok" });
});

ts.web.staticFile("/", "index.html");
ts.web.staticFile("/index.html", "index.html");
ts.web.staticDir("/js", "js");
ts.web.staticDir("/img", "img");

console.log("[IP Blocklist] Started");

