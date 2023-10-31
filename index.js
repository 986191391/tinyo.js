export default class tinyoCanvas {
  constructor(id, options) {
    this.options = options;
    this.events = [];

    this.elMoveLock = false; // 是否可拖拽标记
    this.resizeLock = false;
    this.selectedElement = null; // 记录选中的元素
    this.relativeCoord = null; // 记录鼠标拖拽时相对拖拽元素左上角的坐标位置

    this._initCanvas(id, options);
    this.canvasMousedown = this._watchCanvasMousedown.bind(this);
    this.canvasMousemove = this._watchCanvasMousemove.bind(this);
    this.canvasMouseup = this._watchCanvasMouseup.bind(this);
    this.canvasContextmenu = this._watchCanvasContextmenu.bind(this);

    this._initActions();
    this.renderAll();
  }

  // 前面携带_下斜杠的方法目前定义为类内部的方法，不对外暴露使用
  // 未携带下斜杠的方法可提供给外部使用
  _initCanvas(id, options) {
    this.el = document.getElementById(id);
    this.ctx = this.el.getContext('2d');
    this.ctx.fillStyle = options.fill;
  }

  _initActions() {
    this.el.addEventListener('mousedown', this.canvasMousedown);
    document.addEventListener('contextmenu', this.canvasContextmenu);
  }

  _setCanvasSize () {
    const { width, height } = this.options;
    this.el.width = width;
    this.el.height = height;
  }

  _setCanvasBg () {
    const { backgroundColor } = this.options;
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, this.el.width, this.el.height);
  }

  _watchCanvasClick (e) {
    const sEl = this._getSelectedElement(e);
    this.renderAll();

    if (sEl) {
      this.selectedElement = sEl;
      this._drawHighlightLine(sEl);
    }
    return sEl;
  }

  _watchCanvasMousedown (e) { 
    const sEl = this._watchCanvasClick(e);
    // 如果mouseDown鼠标长按时有元素存在,第一步高亮,第二步开启可拖拽模式
    if (sEl) {
      const { left, top, evented } = sEl;
      // 如果配置了不参与事件，则不触发事件
      if (!evented) return;
      const { x, y } = e;
      const points = getElScalePoints(sEl);
      const resizeKey = getClickPointKey(e, points);

      console.log('resizeKey', resizeKey)
      if (resizeKey) {
        // 点击的位置为扩展点，走缩放逻辑
        this.relativeCoord = { coordX: x, coordY: y, point: points[resizeKey] };
        this.resizeLock = true;
      } else {
        // 非扩展点，拖拽移动逻辑
        this.relativeCoord = { coordX: x - left, coordY: y - top };
        this.elMoveLock = true;
      }

      this.el.addEventListener('mousemove', this.canvasMousemove);
      this.el.addEventListener('mouseup', this.canvasMouseup);
    } else {
      this.selectedElement = null;
      this.el.removeEventListener('mousemove', this.canvasMousemove);
    }
  }

  _watchCanvasMousemove (e) {
    if (!this.selectedElement) return;
    // 鼠标按下未松手且选中了元素 对元素进行拖拽的逻辑
    const { x, y } = e;
    if (this.elMoveLock) {
      const { coordX, coordY } = this.relativeCoord;
      // 计算规则 = 当前鼠标的位置 - mousedown时记录的相对选中元素左上角的位置
      this.selectedElement.left = x - coordX;
      this.selectedElement.top = y - coordY;
    };
    if (this.resizeLock) {
      const { coordX, coordY, point } = this.relativeCoord;
      const { cssVal } = point;
      const { width, height } = this.selectedElement;

      switch (cssVal) {
        case 'n-resize': {
          // this.selectedElement.top = y;
          height > 20 && (this.selectedElement.top = y);
          this.selectedElement.height = Math.max((coordY - y + height), 20);
          break;
        }
        case 's-resize': {
          this.selectedElement.height = Math.max((y - coordY + height), 20);
          break;
        }
        case 'w-resize': {
          // this.selectedElement.left = x;
          width > 20 && (this.selectedElement.left = x);
          this.selectedElement.width = Math.max((coordX - x + width), 20);
          break;
        }
        case 'e-resize': {
          this.selectedElement.width = Math.max((x - coordX + width), 20);
          break;
        }
        case 'se-resize': {
          this.selectedElement.width = Math.max((x - coordX + width), 20);
          this.selectedElement.height = Math.max((y - coordY + height), 20);
          break;
        }
        case 'sw-resize': {
          // this.selectedElement.left = x;
          width > 20 && (this.selectedElement.left = x);
          this.selectedElement.width = Math.max((coordX - x + width), 20);
          this.selectedElement.height = Math.max((y - coordY + height), 20);
          break;
        }
        case 'ne-resize': {
          // this.selectedElement.top = y;
          height > 20 && (this.selectedElement.top = y);
          this.selectedElement.width = Math.max((x - coordX + width), 20);
          this.selectedElement.height = Math.max((coordY - y + height), 20);
          break;
        }
        case 'nw-resize': {
          width > 20 && (this.selectedElement.left = x);
          height > 20 && (this.selectedElement.top = y);
          this.selectedElement.width = Math.max((coordX - x + width), 20);
          this.selectedElement.height = Math.max((coordY - y + height), 20);
          break;
        }
        default:
          break;
      }
      this.relativeCoord.coordX = x;
      this.relativeCoord.coordY = y;
    };
    if (!this.elMoveLock && !this.resizeLock && this.selectedElement) {
      const points = getElScalePoints(this.selectedElement);
      const resizeKey = getClickPointKey(e, points);
      this.el.style.cursor = resizeKey ? points[resizeKey].cssVal : 'default';
    }

    (this.elMoveLock || this.resizeLock) && requestAnimationFrame(() => {
      this.renderAll();
      this._drawHighlightLine(this.selectedElement);
    });
  }

  _watchCanvasMouseup () {
    this.elMoveLock = false;
    this.resizeLock = false;
    this.relativeCoord = null;
    this.el.removeEventListener('mouseup', this.canvasMouseup);
  }

  _watchCanvasContextmenu (e) {
    e.preventDefault();
  }

  _drawEvents () {
    if (!this.events.length) return;
    // 按顺序渲染。顺序很重要，有图层优先级的问题。

    for (let i = 0; i < this.events.length; i++) {
      switch (this.events[i].type) {
        case 'image': {
          const { source, left, top, width, height } = this.events[i];
          this.ctx.drawImage(source, left, top, width, height);
          break;
        }
        case 'text': {
          const { attribute, label, left, top, height } = this.events[i];
          const { fontColor, fontStyle, fontVariant, fontWeight, fontSize, fontFamily } = attribute;
          this.ctx.fillStyle = fontColor || this.options.fill;
          this.ctx.textBaseline = 'bottom';
          this.ctx.font = `${fontStyle || 'normal'} ${fontVariant || 'small-caps'} ${fontWeight || 400} ${fontSize || 12}px ${fontFamily || 'sans-serif'}`;
          this.ctx.fillText(label, left, top + height);
          break;
        }
        case 'rect': {
          const { left, top, width, height, rectColor } = this.events[i];
          this.ctx.fillStyle = rectColor || '#000';
          this.ctx.fillRect(left, top, width, height);
          break;
        }
        default:
          console.log('default')
      }
    }
  }

  _drawHighlightLine (selectedElement) {
    const { width, height, left, top, type, selectable, evented } = selectedElement;
    // 如果配置了selectable, evented，则不绘制高亮线
    if (!selectable || !evented) return;
    // 画线
    this.ctx.strokeStyle = '#1890ff';
    this.ctx.moveTo(left, top);
    this.ctx.lineTo(left + width, top);
    this.ctx.lineTo(left + width, top + height);
    this.ctx.lineTo(left, top + height);
    this.ctx.lineTo(left, top);
    this.ctx.stroke();
    this.ctx.moveTo(left, top + height);
    this.ctx.lineTo(left, top);
    this.ctx.stroke();
    if (type === 'text') return;
    // 画八个点
    this.ctx.fillStyle = "#1890ff";
    this.ctx.beginPath();
    this.ctx.arc(left, top, 5, 0, 2 * Math.PI);
    this.ctx.arc(left + width / 2, top, 5, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(left + width, top, 5, 0, 2 * Math.PI);
    this.ctx.arc(left + width, top + height / 2, 5, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(left + width, top + height, 5, 0, 2 * Math.PI);
    this.ctx.arc(left + width / 2, top + height, 5, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(left, top + height, 5, 0, 2 * Math.PI);
    this.ctx.arc(left, top + height / 2, 5, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  _getSelectedElement (e) {
    const { x, y } = e;
    for(let i = this.events.length - 1; i >= 0; i--) {
      const result = checkClickPointIsInnerElement(x, y, this.events[i])
      if (result) return this.events[i];
    }
    return;
  }

  addText (texts) {
    // 文字的属性： https://www.w3school.com.cn/tags/canvas_font.asp
    for (let i = 0; i < texts.length; i++) {
      const { width, height } = getElementRect(texts[i])
      const { fontColor, fontStyle, fontVariant, fontWeight, fontSize, fontFamily } = texts[i].attribute;

      this.events.push({ ...texts[i], type: 'text', width, height });
      this.ctx.fillStyle = fontColor || this.options.fill;
      this.ctx.textBaseline = 'bottom';
      this.ctx.font = `${fontStyle || 'normal'} ${fontVariant || 'small-caps'} ${fontWeight || 400} ${fontSize || 12}px ${fontFamily || 'Gill Sans'}`;
      this.ctx.fillText(texts[i].label, texts[i].left, texts[i].top + height);
    }
    
    if (texts.length === 1) this._drawHighlightLine(this.events[this.events.length - 1]);
  }

  addImage (imgs) {
    const imgsLen = imgs.length;
    for (let i = 0; i < imgsLen; i++) {
      const { width, height } = imgs[i].source;
      this.events.push({ ...imgs[i], type: 'image', width, height });
      this.ctx.drawImage(imgs[i].source, imgs[i].left, imgs[i].top, width, height);
    }
    if (imgsLen === 1) this._drawHighlightLine(this.events[this.events.length - 1]);
  }

  addRect (rects) {
    const rectsLen = rects.length;
    console.log('rects', rects);
    for (let i = 0; i < rectsLen; i++) {
      const { left, top, width, height, rectColor } = rects[i];
      this.events.push({ ...rects[i], type: 'rect', width, height });
      this.ctx.fillStyle = rectColor || '#000';
      this.ctx.fillRect(left, top, width, height);
    }
  }

  addCircle (circles) {
    const circlesLen = circles.length;
    const tasks = [];
    for (let i = 0; i < circlesLen; i++) {
      const { left, top, radius, circleColor } = circles[i];
      const imgElement = new Image();
      const html = window.btoa(`<svg xmlns='http://www.w3.org/2000/svg' height='${radius * 2}' width='${radius * 2}'>
        <circle cx='${radius}' cy='${radius}' r='${radius - 1}' fill='transparent' stroke='${circleColor || "#000"}' stroke-width='1' ></circle>
      </svg>`);
      imgElement.src = 'data:image/svg+xml;base64,' + html;

      tasks.push(new Promise((resolve) => {
        imgElement.onload = () => {
          console.log('onload', imgElement)
          resolve({
            source: imgElement,
            left,
            top,
            evented: true,
            selectable: true
          });
        }
      }));
    }
    Promise.all(tasks).then(svgs => this.addImage(svgs));
  }

  setBgValue (bgColor) {
    this.options.backgroundColor = bgColor || '#fff';
    this.renderAll();
  }

  downloadPicture (format) {
    const { width, height } = this.options;
    const dataURL = this.el.toDataURL({ width, height, format });

    const download = document.createElement('a');
    download.download = `画板.${format}`;
    download.href = dataURL;
    document.body.appendChild(download);
    download.click();
    document.body.removeChild(download);
  }

  clearCanvas () {
    this.events = [];
    this.renderAll();
  }

  renderAll() {
    this._setCanvasSize();
    this._setCanvasBg();
    this._drawEvents();
  }

  // 对外暴露销毁事件
  beforeUnmountCanvas () {
    this.el.removeEventListener('mousedown', this.canvasMousedown);
    document.removeEventListener('contextmenu', this.canvasContextmenu);
  }
}

// 选中元素的八个缩放点坐标
function getElScalePoints (el) {
  const { left, top, width, height } = el;
  return {
    n: { left: left + width / 2, top, cssVal: 'n-resize' },
    s: { left: left + width / 2, top: top + height, cssVal: 's-resize' },
    w: { left, top: top + height / 2, cssVal: 'w-resize' },
    e: { left: left + width, top: top + height / 2, cssVal: 'e-resize' },
    ne: { left: left + width, top, cssVal: 'ne-resize' },
    nw: { left, top, cssVal: 'nw-resize' },
    se: { left: left + width, top: top + height, cssVal: 'se-resize' },
    sw: { left, top: top + height, cssVal: 'sw-resize' }
  }
}

// 判断当前坐标是否在八个缩放点上
function getClickPointKey (e, points) {
  const { x, y } = e;
  return Object.keys(points).find((p) => {
    const { left, top } = points[p];
    return (x - 5) < left && left < (x + 5) && (y - 5) < top && top < (y + 5);
  })
}

function getElementRect (el) {
  const { fontColor, fontStyle, fontVariant, fontWeight, fontSize, fontFamily } = el.attribute;

  const textElement = document.createElement('span');
  textElement.innerHTML = el.label;
  textElement.style.color = fontColor;
  textElement.style.fontStyle = fontStyle || 'normal';
  textElement.style.fontVariant = fontVariant || 'small-caps';
  textElement.style.fontWeight = fontWeight || 400;
  textElement.style.fontSize = `${fontSize || 12}px`;
  textElement.style.fontFamily = fontFamily || 'Gill Sans';

  document.body.appendChild(textElement);
  const { width, height } = textElement.getBoundingClientRect();
  document.body.removeChild(textElement);

  return { width, height };
}

// 判断点击的坐标是否在渲染的元素内部
function checkClickPointIsInnerElement (x, y, elementInfo) {
  const { width, height, left, top } = elementInfo;
  const xRule = x > left - 5 && x < left + width + 5;
  const yRule = y > top - 5 && y < top + height + 5;
  return xRule && yRule;
}