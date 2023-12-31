# tinyo.js

Javascript HTML5 canvas library<br>
[tinyo.js Demo](http://43.139.113.7:81/#/canvas)

Demo的页面编写基于Vue3，对应的源代码在仓库中的index.vue文件可见。

## 目前已实现

1. 插入文字
2. 插入图片
3. 插入矩形
4. 插入圆形
5. 图片缩放
6. 插入元素的拖拽
7. 背景颜色切换
8. 生成PNG/JPG
9. 持续编写ing...



## 问题记录(随笔)

1. 在canvas标签上绑定width和height的动态属性后，在onmounted生命周期中获取innerWidth和innerHeight赋值。使用这种方式定义的canvas使用其他canvas的方法无效，例如绘图写字等等。暂不明原因。
解决方法是不设置width和height，在onmounted生命周期中获取到canvas元素，同时在js在对canvas的width和height进行设置，onresize的时候也进行修改。

2. canvas绘制图片的时候，不能直接讲import引入的图片当作参数直接传入，需要创建image的dom元素后将dom作为参数传入才可以进行绘制。所以这里需要考虑一个异步的问题，在image的dom元素onload事件完成后做处理。

3. tc.js drawEvents方法的Unexpected lexical declaration in case block  no-case-declarations报错问题,在渲染text的代码中const { fontColor, fontStyle, fontVariant, fontWeight, fontSize, fontFamily } = this.events[i].attribute;报错,导致问题的发生是eslint对域的校验问题,这种申明变量的方式会有作用域提升的问题导致报错.在case内部加上花括号解决.

4. 通过document.createElement创建的元素,在挂载上dom之前获取不到widht和height.目前的解决思路是将创建好的元素append到body上,获取到属性后再remove清除.

5. 文字的渲染有点问题,取top值为0时,渲染不出来.但实际已经渲染,只是超出了画布的区域.这是因为它的渲染规则是根据top的点,文字渲染在上面而非下面导致的问题.

6. [Canvas画三个实心圆为什么中间会填充颜色](https://www.zhihu.com/question/291498001)

7. canvas插入文本，同时出现中文和英文时，默认竖直方向上居中，导致中文超出高亮线。可以通过设置`ctx.textBaseline = 'bottom';`来修改该问题。

8. 将所有的文字转为了svg后以图片的方式插入到canvas中，解决了5的问题。addText的代码中做了一些优化处理，利用promise的机制确保图片全部渲染。同时也避免了画高亮线时需要考虑是图片还是文字的问题。

9. 8的又删掉了，有很多问题。svg转图片的过程中有一个字符串转换的过程，代码的中文无法被成功解析导致报错。还有一个很恶心的问题，在html中写好一个svg标签，通过标签获取后进行转换在赋予image标签，可以触发onload方法。而用js手动创建的svg不能触发onload方法。解决不了这个问题。

10. 图片选中后高亮线周围会出现八个点，长按拖拽可以对图片进行缩放。思路如下：

1、mousedown的时候首先判断是否点击到元素，是则高亮继续以下逻辑
2、判断点击的位置是否为元素的八个可缩放点(点位的正负5范围内都可点击，做了小处理)
3、定义了一个resizeLock的字段，在mousemove的时候该字段为true时代表当前的move是对选中元素进行缩放
4、每个点位缩放的方式不同，有些会改变渲染的起点，有些只改变宽高等，这里用switch/case做了处理，为了看的更加清晰。
5、最后将缩放后元素的值进行修改，renderAll重新渲染即可。
6、不得不感叹canvas的性能是真的强大！

11. 添加圆形，通过创建svg的方式以图片的方式插入了圆形，处理逻辑变为图片的方式，解决了很多问题。