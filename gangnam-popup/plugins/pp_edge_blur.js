function krpanoplugin() {
    var api, shaders = [], list;
    this.registerplugin = function (k, path, plugin) {
        api = k;
        plugin.registerattribute('range', 20);
        if (!k.webGL) return;
        list = k.webGL.ppShaderArray2;
        // Separable Gaussian with adjacent samples avoids sparse disk sampling shimmer.
        var taps = 40, sigma = 8, weights = [], sum = 0;
        for (var i = -taps; i <= taps; i++) {
            var weight = Math.exp(-0.5 * Math.pow(i / 2 / sigma, 2));
            weights.push(weight);
            sum += weight;
        }
        for (var pass = 0; pass < 2; pass++) {
            var source = [
                'precision highp float;',
                'uniform sampler2D sm;',
                'varying vec2 tx;',
                'uniform vec2 texelSize;',
                'uniform float radius;',
                'void main() {',
                'float a = smoothstep(0.55, 1.05, length((tx - vec2(0.5)) * 2.0));',
                'if (a < 0.001) { gl_FragColor = texture2D(sm, tx); return; }',
                'vec2 stepSize = vec2(' + (pass === 0 ? '1.0, 0.0' : '0.0, 1.0') + ') * (radius / 20.0) * a * texelSize;',
                'vec4 color = vec4(0.0);'
            ];
            for (var j = -taps; j <= taps; j++) {
                source.push('color += texture2D(sm, clamp(tx + stepSize * ' + (j / 2).toFixed(1) + ', vec2(0.0), vec2(1.0))) * ' + (weights[j + taps] / sum).toFixed(10) + ';');
            }
            source.push('gl_FragColor = color;', '}');
            var shader = k.webGL.createPostProcessingShader(source.join('\n'), 'radius,texelSize', 'day1_gaussian_' + pass, function (side, sh, gl) {
                gl.uniform1f(sh.radius, Math.max(0, Number(plugin.range) || 0));
                // Use the current render target, including resizing and high-DPI screens.
                var viewport = gl.getParameter(gl.VIEWPORT);
                gl.uniform2f(sh.texelSize, 1 / Math.max(1, viewport[2]), 1 / Math.max(1, viewport[3]));
            });
            if (shader) { shaders.push(shader); list.push(shader); }
        }
    };
    this.unloadplugin = function () {
        shaders.forEach(function (shader) {
            var index = list.indexOf(shader);
            if (index >= 0) list.splice(index, 1);
            api.webGL.deleteShader(shader);
        });
        shaders = []; list = api = null;
    };
}