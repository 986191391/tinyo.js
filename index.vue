<template>
  <div class="container">
    <canvas id="tinyoCanvas" ref="tinyoCanvas"></canvas>
    <aside>
      <h2>更新时间: 2023-10-31</h2>
      <h2>画板设置</h2>
      <div class="action-container">
        <section class="action-items">
          <span class="action-items-label">背景颜色:</span>
          <div class="action-items-value">
            <el-color-picker v-model="options.backgroundColor" size="small" @change="onSetBackgroundColor" />
            <span class="background-color">{{options.backgroundColor}}</span>
          </div>
        </section>
        <section class="action-items">
          <span class="action-items-label">插入文字:</span>
          <div class="action-items-value action-items-input-text">
            <el-input v-model="inputText" size="small" placeholder="文字描述" />
            <el-button type="primary" size="small" @click="uploadText">确定</el-button>
          </div>
        </section>
        <section class="action-items">
          <span class="action-items-label">插入矩形:</span>
          <div class="action-items-value">
            <el-input v-model="rectWidth" style="width: 60px" size="small" placeholder="矩形宽度" />
            <el-input v-model="rectHeight" style="width: 60px" size="small" placeholder="矩形高度" />
            <el-button type="primary" size="small" style="margin-left: 10px" @click="uploadRect">确定</el-button>
          </div>
        </section>
        <section class="action-items">
          <span class="action-items-label">插入圆形:</span>
          <div class="action-items-value">
            <el-input v-model="circleRadius" style="width: 60px" size="small" placeholder="半径" />
            <el-button type="primary" size="small" style="margin-left: 10px" @click="uploadCircle">确定</el-button>
          </div>
        </section>
        <section class="action-items">
          <span class="action-items-label">插入图片:</span>
          <div class="action-items-value">
            <el-button type="ghost" size="small" @click="uploadImage">点击插入图片</el-button>
          </div>
        </section>
        <section class="action-items">
          <span class="action-items-label">清空画布:</span>
          <div class="action-items-value">
            <el-button type="ghost" size="small" @click="clearCanvas">点击清空画布</el-button>
          </div>
        </section>
        <section class="action-items">
          <span class="action-items-label">生成图片:</span>
          <div class="action-items-value action-items-insert-image">
            <el-button type="ghost" size="small" @click="() => getPicture('png')">导出PNG</el-button>
            <el-button type="ghost" size="small" @click="() => getPicture('jpg')">导出JPG</el-button>
          </div>
        </section>
      </div>
      <!-- <section class="action-items">
        <div class="action-container">
          更新时间: 2023-10-31
        </div>
      </section> -->
    </aside>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, onBeforeMount, onMounted, onUnmounted } from 'vue';
import { PlusOutlined } from '@ant-design/icons-vue'
import tc from './tc';
import monkey from '@/assets/fabric/monkey.png'
import cap from '@/assets/fabric/cap.png'

const exm = ref(null);
const inputText = ref('');
const rectWidth = ref(100);
const rectHeight = ref(50);
const circleRadius = ref(100);

const options = reactive({
  width: 0,
  height: 0,
  backgroundColor: '#fff'
});

onMounted(() => {
  const { innerHeight, innerWidth } = window;
  exm.value = new tc('tinyoCanvas', {
    width: innerWidth - 350,
    height: innerHeight,
    fill: '#000',
    backgroundColor: '#fff'
  })
  
  // 插入默认的图片
  Promise.all(
    [ buildImageInfo(monkey, 150, 50), buildImageInfo(cap, 250, 100) ]
  ).then((imgs) => {
    exm.value.addImage(imgs);
    // 插入默认的文字
    const texts = [
      { label: 'Canvas Learn', attribute: { fontSize: 26 }, top: 50, left: 80, evented: true, selectable: true },
      { label: 'Tinyo', attribute: { fontSize: 26 }, top: 150, left: 180, evented: true, selectable: true }
    ];
    exm.value.addText(texts);
  });
})

const buildImageInfo = (imgSrc: string, left: number, top: number) => {
  return new Promise((resolve) => {
    const imgElement = new Image();
    imgElement.src = imgSrc

    imgElement.onload = () => {
      const imgInfo = {
        source: imgElement,
        left,
        top,
        evented: true,
        selectable: true
      }
      resolve(imgInfo)
    }
  })
}

const uploadText = () => {
  const { innerHeight, innerWidth } = window;
  const texts = [
    { label: inputText.value, attribute: { fontSize: 26, fontColor: '#000' }, top: innerHeight / 2, left: (innerWidth - 350) / 2, evented: true, selectable: true },
  ];
  exm.value.addText(texts);
  inputText.value = '';
}

const uploadRect = () => {
  const rects = [
    { rectColor: 'red', top: innerHeight / 2, left: (innerWidth - 350) / 2, width: rectWidth.value, height: rectHeight.value, evented: true, selectable: true },
  ];
  exm.value.addRect(rects);
}

const uploadCircle = () => {
  const circles = [
    { circleColor: 'pink', top: innerHeight / 2, left: (innerWidth - 350) / 2, radius: circleRadius.value, evented: true, selectable: true },
  ];
  exm.value.addCircle(circles)
}

const uploadImage = () => {
  const uploadInput = document.createElement('input');
  uploadInput.setAttribute('type', 'file');
  uploadInput.setAttribute('accept', 'image/*');
  uploadInput.click();
  uploadInput.onchange = () => {
    const file = uploadInput.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = e => {
      const imgElement = document.createElement('img');
      imgElement.src = e.target.result
      imgElement.onload = () => {
        const imgInfo = {
          source: imgElement,
          left: 0,
          top: 0,
          evented: true,
          selectable: true
        }
        exm.value.addImage([imgInfo])
      }
    }
    uploadInput.remove()
  }
}

const clearCanvas = () => {
  exm.value.clearCanvas();
}

const getPicture = (format) => {
  exm.value.downloadPicture(format)
}

const onSetBackgroundColor = (bgColor: string) => {
  exm.value.setBgValue(bgColor);
}
</script>

<style scoped lang="less">
.container {
  display: flex;

  & > aside {
    width: 350px;
    height: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #eee;
    color: #000;
    border-left: 1px solid #000;
    text-align: left;

    h2 {
      margin: 0;
      padding: 10px 20px;
      border-bottom: 1px solid #000;
    }

    .action-container {
      padding: 10px 0;
      .action-items {
        padding: 0 10px;
        width: 100%;
        min-height: 40px;
        display: flex;
        align-items: center;

        .action-items-label {
          width: 100px;
          text-align: right;
          font-size: 14px;
        }

        .action-items-value {
          padding-left: 10px;
          display: flex;
          align-items: center;

          .background-color {
            margin-left: 10px;
            font-size: 13px;
          }

          &.action-items-width-height {
            .el-input {
              width: 50px;
              height: 30px;
              ::v-deep .el-input__inner {
                padding: 0;
                height: 30px;
                text-align: center;
              }
            }
            .width-height-label {
              margin: 0 5px;
            }
          }

          &.action-items-input-text {
            .el-input {
              width: 120px;
            }
            
            .el-button {
              margin-left: 10px;
            }
          }

          &.action-items-has-input-text {
            padding: 10px;
            display: flex;
            align-items: flex-start;
            flex-direction: column;

            .font-item {
              display: flex;
              font-size: 14px;
              margin-bottom: 10px;

              .font-value {
                margin-right: 10px;
                width: 150px;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                border-bottom: 1px solid #ccc;
              }

              .el-icon-delete {
                display: flex;
                align-items: center;
                cursor: pointer;

                &:hover {
                  font-weight: bold;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>