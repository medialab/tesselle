export default function(slideshow) {
  return `
<html>
  <head>
    <title>${slideshow.name}</title>
  <link rel="icon" href="https://medialab.github.io/tesselle/favicon.ico" />
    <!-- META DUBLIN CORE -->
    <meta name="DC.Title" lang="fr" content="${slideshow.name}" />
    <meta name="DC.subject" xml:lang="en-GB" content="image annotation" />
    <meta name="DC.subject" xml:lang="en-GB" content="image publication" />
    <!-- END META DUBLIN CORE -->

    <!-- REGULAR META -->
    <!--<meta name="author" content="médialab Sciences Po" />-->
    <meta name="keywords" content="image annotation, dense captionning, image tiling" />
    <meta name="description" content="a tesselle-made image publication" />
    <meta name="viewport" content="user-scalable=no,width=device-width" />
    <!-- END REGULAR META -->

    <!-- META TWITTER -->
    <meta name="twitter:card" value="summary" />
    <meta name="twitter:site" content="https://medialab.github.io/tesselle">
    <meta name="twitter:title" content="${slideshow.name}" />
    <meta name="twitter:description" content="a tesselle-made image publication" />
    <!-- Twitter Summary card images must be at least 200x200px -->
    <meta name="twitter:image" content="https://medialab.github.io/tesselle/icon-512x512.png" />
    <!-- end meta twitter-->

    <!-- META GOOGLE + -->
    <meta itemprop="name" content="${slideshow.name}" />
    <meta itemprop="description" content="a tesselle-made image publication" />
    <meta itemprop="image" content="https://medialab.github.io/tesselle/icon-512x512.png" />
    <!-- END META GOOGLE + -->

    <!-- META OPEN GRAPH / FACEBOOK -->
    <meta property="og:title" content="${slideshow.name}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://medialab.github.io/tesselle/"/>
    <meta property="og:description" content="a tesselle-made image publication" />
    <meta property="og:image" content="https://medialab.github.io/tesselle/icon-512x512.png"/>
    <meta property="og:image:width" content="512"/>
    <meta property="og:image:height" content="512"/>
    <!-- END META OPEN GRAPH / FACEBOOK -->
    <style>p { color: lightblue }</style>
    <script>
      locationUrl = window.location.href.replace(window.location.protocol, '').replace('/index.html', '');
      const url = 'http://medialab.github.io/tesselle/#/viewer/?url=' + locationUrl;
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
}
