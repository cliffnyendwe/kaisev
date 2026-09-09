(function(h,o,u,n,d) {
    h=h[d]=h[d]||{q:[],onReady:function(c){h.q.push(c)}}
    d=o.createElement(u);d.async=1;d.src=n;d.crossOrigin=''
    n=o.getElementsByTagName(u)[0];n.parentNode.insertBefore(d,n)
})(window,document,'script','https://www.datadoghq-browser-agent.com/us1/v7/datadog-rum.js','DD_RUM')
window.DD_RUM.onReady(function() {
    window.DD_RUM.init({
        applicationId: 'd4dc8952-0e4b-4f3e-9bd8-382c53c79912',
        clientToken: 'pub575e5004b117dacbe065c524e26eb7d1',
        site: 'datadoghq.com',
        service: 'Marketing_Global',
        env: 'PRD',
        version: '1.0.0',
        sessionSampleRate: 100,
        sessionReplaySampleRate: 100,
        trackResources: true,
        trackUserInteractions: true,
        trackLongTasks: true,
        defaultPrivacyLevel: 'mask-user-input',        // 'mask-user-input' | 'allow' | 'mask'
    });
})