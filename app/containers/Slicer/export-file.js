export default `
<html>
  <head>
    <style>p { color: lightblue }</style>
    <script>
      locationUrl = window.location.href.replace(window.location.protocol, '').replace('/index.html', '');
      const url = 'http://localhost:3000/#/viewer/?url=' + locationUrl;
      function setUrl () {
        const link = document.getElementById('link');
        console.log(link, url);
        link.href = url;
        link.append(url);
      }
      if(window.addEventListener) {
        window.addEventListener('load', setUrl, false);
      } else {
        window.attachEvent('onload', setUrl);
      }
    </script>
  </head>
  <body>
    <p>Click to see your image : </p> <a id='link' href=''></a>
  </body>
</html>
`;
