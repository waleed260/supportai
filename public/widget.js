// SupportAI Web Chat Widget - Embed Script
// Add this to your website: <script src="https://your-domain.com/widget.js" data-org-id="YOUR_ORG_ID"></script>

(function() {
  const script = document.currentScript
  const orgId = script.getAttribute('data-org-id')
  if (!orgId) return

  const baseUrl = script.getAttribute('data-base-url') || window.location.origin

  const container = document.createElement('div')
  container.id = 'supportai-widget'
  document.body.appendChild(container)

  const iframe = document.createElement('iframe')
  iframe.src = baseUrl + '/widget/' + orgId
  iframe.style.cssText = 'border:none;position:fixed;bottom:0;right:0;width:400px;height:600px;z-index:999999;max-width:100vw;max-height:100vh;'
  container.appendChild(iframe)

  window.addEventListener('message', function(event) {
    if (event.data.type === 'supportai-resize') {
      iframe.style.height = event.data.height + 'px'
    }
  })
})()
