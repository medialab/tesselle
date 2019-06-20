export default `
<html>
  <head>
    <style>p { color: lightblue }</style>
    <script>
      locationUrl = window.location.href.replace(window.location.protocol, '').replace('/index.html', '');
      const url = 'http://medialab.github.io/Tesselle/#/viewer/?url=' + locationUrl;
      function setUrl () {
        const iframe = document.getElementById('iframe');
        iframe.src = url;
      }
      if(window.addEventListener) {
        window.addEventListener('load', setUrl, false);
      } else {
        window.attachEvent('onload', setUrl);
      }
    </script>
  </head>
  <style>
      #iframe{
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        position: fixed;
        border: none;
      }
  </style>
  <body>
    <iframe id="iframe"></iframe>
  </body>
</html>
`;
