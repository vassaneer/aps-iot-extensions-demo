/// import * as Autodesk from "@types/forge-viewer";

export class SensorHeatmapsPanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor(viewer, id, title, options) {
        super(viewer.container, id, title, options);
        this.container.style.left = ((options === null || options === void 0 ? void 0 : options.x) || 0) + 'px';
        this.container.style.top = ((options === null || options === void 0 ? void 0 : options.y) || 0) + 'px';
        this.container.style.width = '300px';
        this.container.style.height = '150px';
        this.container.style.resize = 'none';
    }

    initialize() {
        this.title = this.createTitleBar(this.titleLabel || this.container.id);
        this.initializeMoveHandlers(this.title);
        this.container.appendChild(this.title);
        this.content = document.createElement('div');
        this.content.style.height = '100px';
        this.content.style.backgroundColor = '#333';
        this.content.style.color = '#eee';
        this.content.style.opacity = 0.9;
        this.content.innerHTML = `
            <div style="height: 50px; padding: 1em; box-sizing: border-box;">
                <label>Channel</label>
                <select id="iot-heatmap-channel">
                </select>
            </div>
            <div style="height: 50px">
                <canvas id="iot-heatmap-legend" width="300" height="50"></canvas>
            </div>
        `;
        this.container.appendChild(this.content);
        this.dropdown = document.getElementById('iot-heatmap-channel');
        this.canvas = document.getElementById('iot-heatmap-legend');
    }

    updateChannels(dataView) {
        if (!this.dropdown) {
            return;
        }
        this.dropdown.innerHTML = '';
        for (const [channelId, channel] of dataView.getChannels().entries()) {
            const option = document.createElement('option');
            option.value = channelId;
            option.innerText = channel.name;
            this.dropdown.appendChild(option);
        }
        this.dropdown.onchange = () => this.onDropdownChanged(dataView);
        this.onDropdownChanged(dataView);
    }

    colourNameToHex(colour)
    {
        var colours = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
          "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
          "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
          "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
          "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
          "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
          "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
          "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
          "honeydew":"#f0fff0","hotpink":"#ff69b4",
          "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
          "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
          "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
          "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
          "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
          "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
          "navajowhite":"#ffdead","navy":"#000080",
          "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
          "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
          "rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
          "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
          "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
          "violet":"#ee82ee",
          "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
          "yellow":"#ffff00","yellowgreen":"#9acd32"
          };
        for(const key  of Object.keys(colours)){
          if(colours[key] == colour.toLowerCase()){
            return key;
          }
        }
        return false;
    }

    onDropdownChanged(dataView) {
        if (!this.dropdown) {
            return;
        }
        const channel = dataView.getChannels().get(this.dropdown.value);
        if (!channel) {
            return;
        }
        const labels = [
            `${channel.min.toFixed(2)}${channel.unit}`,
            `${((channel.max + channel.min) / 2).toFixed(2)}${channel.unit}`,
            `${channel.max.toFixed(2)}${channel.unit}`
        ];
        var colorStops = ['Blue', 'green', 'yellow', 'red']; // Default color stops of the DataViz heatmap extension
        // get data shading
        if(dataView.getChannels().get(this.dropdown.value).color){
          colorStops = [];
          for(const color of dataView.getChannels().get(this.dropdown.value).color){
            colorStops = colorStops.concat(this.colourNameToHex(color));
          }
        }
        this.updateLegend(labels, colorStops);
        if (this.onChannelChanged) {
            this.onChannelChanged(this.dropdown.value);
        }
    }

    updateLegend(labels, colorStops) {
        if (!this.canvas) {
            return;
        }
        const context = this.canvas.getContext('2d');
        let i, len;
        context.clearRect(0, 0, 300, 50);
        context.fillStyle = 'white';
        for (i = 0, len = labels.length; i < len; i++) {
            let x = 10 + 280 * i / (len - 1);
            if (i === len - 1) {
                x -= context.measureText(labels[i]).width;
            }
            else if (i > 0) {
                x -= 0.5 * context.measureText(labels[i]).width;
            }
            context.fillText(labels[i], x, 10);
        }
        const gradient = context.createLinearGradient(0, 0, 300, 0);
        for (i = 0, len = colorStops.length; i < len; i++) {
            gradient.addColorStop(i / (len - 1), colorStops[i]);
        }
        context.fillStyle = gradient;
        context.fillRect(10, 20, 280, 20);
    }
}
