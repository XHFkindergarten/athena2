module.exports = function (buildConfig) {
  const HeadJavascriptInjectPlugin = createFragment(buildConfig)
  return {
    plugins: [
      new HeadJavascriptInjectPlugin()
    ]
  }
}

const createFragment = function (buildConfig) {
  const enableREM = buildConfig.enableREM
  const headJavascript = enableREM ? `
    <!-- begin REM Zoom 计算 -->
    <script type="text/javascript">
      (function (win) {
        var remCalc = {};
        var docEl = win.document.documentElement;
        var tid;
        var hasRem = ${buildConfig.enableREM};

        function refresh() {
          var width = docEl.clientWidth;
          var height = docEl.clientHeight;
          if (width > 1024) width = 1024;
          if (hasRem) {
            var rem = width / ${buildConfig.baseSize};
            docEl.style.fontSize = rem + "px";
            remCalc.rem = rem;
            var actualSize = parseFloat(window.getComputedStyle(document.documentElement)["font-size"]);
            if (actualSize !== rem && actualSize > 0 && Math.abs(actualSize - rem) > 1) {
              var remScaled = rem * rem / actualSize;
              docEl.style.fontSize = remScaled + "px";
            }
          }
        }

        function dbcRefresh() {
          clearTimeout(tid);
          tid = setTimeout(refresh, 100)
        }
        win.addEventListener("resize", function () {
          dbcRefresh()
        }, false);

        win.addEventListener("pageshow", function (e) {
          if (e.persisted) {
            dbcRefresh();
          }
        }, false);
        refresh();
        if (hasRem) {
          remCalc.refresh = refresh;
          remCalc.rem2px = function (d) {
            var val = parseFloat(d) * this.rem;
            if (typeof d === "string" && d.match(/rem$/)) {
              val += "px";
            }
            return val;
          };
          remCalc.px2rem = function (d) {
            var val = parseFloat(d) / this.rem;
            if (typeof d === "string" && d.match(/px$/)) {
              val += "rem";
            }
            return val;
          };
          win.remCalc = remCalc;
        }
      })(window);

    </script>
    <!-- end REM Zoom 计算 -->` : ''

  function HeadJavascriptInjectPlugin (options) {
    // Configure your plugin with options...
  }

  HeadJavascriptInjectPlugin.prototype.apply = function (compiler) {
    compiler.plugin('compilation', function (compilation) {
      compilation.plugin('html-webpack-plugin-before-html-processing', function (htmlPluginData, callback) {
        let html = htmlPluginData.html
        html = html.replace('{{{__HEAD_JAVASCRIPT__}}}', headJavascript)
        htmlPluginData.html = html
        callback(null, htmlPluginData)
      })
    })
  }

  return HeadJavascriptInjectPlugin
}
