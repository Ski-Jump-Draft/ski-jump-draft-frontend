// /lib/disableConsole.ts
if (typeof window !== "undefined") {
    const isProd = process.env.NODE_ENV === "production";
    const isStaging = process.env.NEXT_PUBLIC_ENV === "staging";

    if (isProd && !isStaging) {
        const noop = () => { };
        console.log = noop;
        console.info = noop;
        console.warn = noop;
        console.error = noop;
        console.debug = noop;
    }
}
