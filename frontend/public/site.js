/**
 * This function is used to resolve relative /media/... paths against the API host in production.
 * if the host is project-electricity.app or www.project-electricity.app, or if the host is a railway app, then the function will return the https://api.project-electricity.app URL.
 * otherwise, the function will return the global.location.origin URL (which is the same-origin URL for local development)
 */
(function (global) {
    function mediaApiBase() {
        const host = global.location.hostname;
        if (
            host === "project-electricity.app" ||
            host === "www.project-electricity.app" ||
            (/\.up\.railway\.app$/i.test(host) && !/^api[.-]/i.test(host))
        ) {
            return "https://api.project-electricity.app";
        }
        return global.location.origin.replace(/\/$/, "");
    }

    global.mediaUrl = function mediaUrl(url) {
        if (!url) return "";
        if (/^https?:\/\//i.test(url)) return url;
        const path = url.startsWith("/") ? url : "/" + url;
        return mediaApiBase() + path;
    };
})(window);
