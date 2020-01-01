(function() {
  var canvas = document.querySelector("#paint");
  var ctx = canvas.getContext("2d");
  var areaForPaint = document.querySelector("#areaForPaint");
  var areaForPaint_style = getComputedStyle(areaForPaint);
  canvas.width = parseInt(areaForPaint_style.getPropertyValue("width"));
  canvas.height = parseInt(areaForPaint_style.getPropertyValue("height"));

  var canvas_small = document.getElementById("brush_size");
  var context_small = canvas_small.getContext("2d");
  var centerX = canvas_small.width / 2;
  var centerY = canvas_small.height / 2;
  var radius;

  var tmp_canvas = document.createElement("canvas");
  var tmp_ctx = tmp_canvas.getContext("2d");
  tmp_canvas.id = "tmp_canvas";
  tmp_canvas.width = canvas.width;
  tmp_canvas.height = canvas.height;
  areaForPaint.appendChild(tmp_canvas);

  var textarea = document.createElement("textarea");
  textarea.id = "text_tool";
  areaForPaint.appendChild(textarea);

  var tmp_txt_ctn = document.createElement("div");
  tmp_txt_ctn.style.display = "none";
  areaForPaint.appendChild(tmp_txt_ctn);

  var mouse = { x: 0, y: 0 };
  var start_mouse = { x: 0, y: 0 };

  var imgData;
  var imgCopyRand;
  var imgCopyRandMain;

  var ppts = [];
  var undo_arr = [];
  var undo_count = 0;
  var empty_canv;
  var xcopy;
  var ycopy;
  var xForCopy;
  var yForCopy;
  var whatPaste;
  var lastWidth;
  var lastColor;
  var lastAlpha;
  var r, g, b;
  var alpha;
  var tool = "brush";

  $("#tools")
    .find(":button")
    .on("click", function() {
      tool = $(this).attr("id");
      console.log("tool = ", tool);
    });

  document.getElementById("text-size").addEventListener("change", function() {
    var size = document.getElementById("text-size").value;
    document.getElementById("text_tool").style.fontSize = parseInt(size) + "px";
  });
  document.getElementById("font").addEventListener("change", function() {
    var font = document.getElementById("font");
    var fontStraa = font.options[font.selectedIndex].text;
    console.log(fontStraa);
    document.getElementById("text_tool").style.fontFamily = fontStraa;
  });

  $("#colors")
    .find(":button")
    .on("click", function() {
      tmp_ctx.strokeStyle = $(this).attr("id");
      r = hexToRgb(tmp_ctx.strokeStyle).r;
      g = hexToRgb(tmp_ctx.strokeStyle).g;
      b = hexToRgb(tmp_ctx.strokeStyle).b;
      tmp_ctx.fillStyle = tmp_ctx.strokeStyle;
      console.log("color = ", tmp_ctx.strokeStyle);
      document.getElementById("color").value = $(this).attr("id");
      drawBrush();
    });
  document.getElementById("color").addEventListener("change", function() {
    tmp_ctx.strokeStyle = document.getElementById("color").value;
    r = hexToRgb(tmp_ctx.strokeStyle).r;
    g = hexToRgb(tmp_ctx.strokeStyle).g;
    b = hexToRgb(tmp_ctx.strokeStyle).b;
    tmp_ctx.fillStyle = tmp_ctx.strokeStyle;
    console.log("color = ", tmp_ctx.strokeStyle);
    drawBrush();
  });

  document.getElementById("width_range").addEventListener("change", function() {
    tmp_ctx.lineWidth = document.getElementById("width_range").value / 2;
    drawBrush();
  });
  document
    .getElementById("opacity_range")
    .addEventListener("change", function() {
      tmp_ctx.globalAlpha =
        document.getElementById("opacity_range").value / 100;
      alpha = Math.round(tmp_ctx.globalAlpha * 255);
      console.log("opasity = ", alpha);
      drawBrush();
    });

  document.getElementById("clear").addEventListener("click", function() {
    ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
  });

  var drawBrush = function() {
    context_small.clearRect(0, 0, canvas_small.width, canvas_small.height);

    radius = tmp_ctx.lineWidth;
    radius = radius / 2;

    context_small.beginPath();
    context_small.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context_small.fillStyle = tmp_ctx.strokeStyle;
    context_small.globalAlpha = tmp_ctx.globalAlpha;
    context_small.fill();
  };
  tmp_ctx.lineWidth = document.getElementById("width_range").value / 2;
  tmp_ctx.lineJoin = "round";
  tmp_ctx.lineCap = "round";
  tmp_ctx.strokeStyle = "blue";
  tmp_ctx.fillStyle = "blue";
  r = 0;
  g = 0;
  b = 255;
  alpha = 255;

  drawBrush();

  empty_canv = canvas.toDataURL();
  undo_arr.push(empty_canv);

  tmp_canvas.addEventListener(
    "mousemove",
    function(e) {
      mouse.x = typeof e.offsetX !== "undefined" ? e.offsetX : e.layerX;
      mouse.y = typeof e.offsetY !== "undefined" ? e.offsetY : e.layerY;
    },
    false
  );

  tmp_canvas.addEventListener(
    "mousedown",
    function(e) {
      console.log("tool = ", tool);
      tmp_canvas.addEventListener("mousemove", onPaint, false);
      if (tool == "text") {
        var lines = textarea.value.split("\n");
        var processed_lines = [];

        for (var i = 0; i < lines.length; i++) {
          var chars = lines[i].length;

          for (var j = 0; j < chars; j++) {
            var text_node = document.createTextNode(lines[i][j]);
            tmp_txt_ctn.appendChild(text_node);

            // Since tmp_txt_ctn is not taking any space
            // in layout due to display: none, we gotta
            // make it take some space, while keeping it
            // hidden/invisible and then get dimensions
            tmp_txt_ctn.style.position = "absolute";
            tmp_txt_ctn.style.visibility = "hidden";
            tmp_txt_ctn.style.display = "block";

            var width = tmp_txt_ctn.offsetWidth;

            tmp_txt_ctn.style.position = "";
            tmp_txt_ctn.style.visibility = "";
            tmp_txt_ctn.style.display = "none";

            if (width > parseInt(textarea.style.width)) {
              break;
            }
          }

          processed_lines.push(tmp_txt_ctn.textContent);
          tmp_txt_ctn.innerHTML = "";
        }

        var ta_comp_style = getComputedStyle(textarea);
        var fs = ta_comp_style.getPropertyValue("font-size");
        var ff = ta_comp_style.getPropertyValue("font-family");

        tmp_ctx.font = fs + " " + ff;
        tmp_ctx.textBaseline = "top";

        for (var n = 0; n < processed_lines.length; n++) {
          var processed_line = processed_lines[n];

          tmp_ctx.fillText(
            processed_line,
            parseInt(textarea.style.left),
            parseInt(textarea.style.top) + n * parseInt(fs)
          );
        }

        textarea.style.display = "none";
        textarea.value = "";
      }
      mouse.x = typeof e.offsetX !== "undefined" ? e.offsetX : e.layerX;
      mouse.y = typeof e.offsetY !== "undefined" ? e.offsetY : e.layerY;

      if (tool == "copy" || tool == "copyrand") {
        lastColor = tmp_ctx.strokeStyle;
        lastWidth = tmp_ctx.lineWidth;
        lastAlpha = tmp_ctx.globalAlpha;
      }

      start_mouse.x = mouse.x;
      start_mouse.y = mouse.y;

      ppts.push({ x: mouse.x, y: mouse.y });
    },
    false
  );

  textarea.addEventListener("mouseup", function() {
    tmp_canvas.removeEventListener("mousemove", onPaint, false);
  });

  tmp_canvas.addEventListener(
    "mouseup",
    function() {
      tmp_canvas.removeEventListener("mousemove", onPaint, false);
      if (tool == "fill") {
        onPaint();
      }
      if (tool == "paste") {
        if (whatPaste == 2) {
          console.log("xForCopy,yForCopy = ", xForCopy, yForCopy);
          var imgCopyRandDop = ctx.createImageData(imgCopyRand);
          imgCopyRandDop.data.set(imgCopyRand.data);
          pasteRand(imgCopyRandDop);
        } else {
          ctx.putImageData(imgData, mouse.x, mouse.y);
        }
      }

      ctx.globalCompositeOperation = "source-over";

      if (tool == "copy") {
        tmp_ctx.setLineDash([0, 0]);
        tmp_ctx.strokeStyle = lastColor;
        tmp_ctx.lineWidth = lastWidth;
        tmp_ctx.globalAlpha = lastAlpha;
      }

      if (tool == "copyrand") {
        tmp_ctx.beginPath();
        tmp_ctx.moveTo(start_mouse.x, start_mouse.y);
        tmp_ctx.lineTo(xcopy, ycopy);
        tmp_ctx.stroke();
        tmp_ctx.closePath();
        imgCopyRand = tmp_ctx.getImageData(
          0,
          0,
          tmp_canvas.width,
          tmp_canvas.height
        );
        imgCopyRandMain = ctx.getImageData(
          0,
          0,
          tmp_canvas.width,
          tmp_canvas.height
        );
        whatPaste = 2;
        tmp_ctx.strokeStyle = lastColor;
        tmp_ctx.lineWidth = lastWidth;
        tmp_ctx.globalAlpha = lastAlpha;
        tool = "no";
      } else if (tool == "no") {
        xForCopy = start_mouse.x;
        yForCopy = start_mouse.y;
        tool = "copyrand";
        console.log(imgCopyRand);
      }

      if (tool != "copyrand" && tool != "copy" && tool != "no") {
        ctx.drawImage(tmp_canvas, 0, 0);
      }

      tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
      ppts = [];

      undo_arr.push(canvas.toDataURL());
      undo_count = 0;
    },
    false
  );

  var callDownload = function() {
    download(paint, "myPicture.png");
  };
  document
    .getElementById("id_download")
    .addEventListener("click", callDownload);
  function download(canvas, filename) {
    var lnk = document.createElement("a"),
      e;

    lnk.download = filename;

    lnk.href = canvas.toDataURL();

    if (document.createEvent) {
      e = new MouseEvent("click", {});

      lnk.dispatchEvent(e);
    } else if (lnk.fireEvent) {
      lnk.fireEvent("onclick");
    }
  }

  document.getElementById("undo").addEventListener("click", function() {
    if (undo_arr.length > 1) {
      if (undo_count + 1 < undo_arr.length) {
        if (undo_count + 2 == undo_arr.length) {
          if (
            confirm(
              "Вы действительно хотите отменить? Этот шаг нельзя будет вернуть!"
            )
          ) {
            undo_count++;
            UndoFunc(undo_count);
          }
        } else {
          undo_count++;
          UndoFunc(undo_count);
        }
        if (undo_count + 1 == undo_arr.length) {
          undo_count = 0;
          undo_arr = [];
          undo_arr.push(empty_canv);
        }
      }
    }
  });

  document.getElementById("redo").addEventListener("click", function() {
    if (undo_count > 0) {
      undo_count--;
      UndoFunc(undo_count);
    }
  });
  var UndoFunc = function(count) {
    var number = undo_arr.length;
    var img_data = undo_arr[number - (count + 1)];
    var undo_img = new Image();

    undo_img.src = img_data.toString();

    ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
    ctx.drawImage(undo_img, 0, 0);
  };

  var onPaintBrush = function() {
    tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

    ppts.push({ x: mouse.x, y: mouse.y });

    if (ppts.length < 3) {
      var b = ppts[0];
      tmp_ctx.beginPath();
      tmp_ctx.arc(b.x, b.y, tmp_ctx.lineWidth / 2, 0, Math.PI * 2, !0);
      tmp_ctx.fill();
      tmp_ctx.closePath();

      return;
    }

    tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

    tmp_ctx.beginPath();
    tmp_ctx.moveTo(ppts[0].x, ppts[0].y);

    for (var i = 1; i < ppts.length - 2; i++) {
      var c = (ppts[i].x + ppts[i + 1].x) / 2;
      var d = (ppts[i].y + ppts[i + 1].y) / 2;

      tmp_ctx.quadraticCurveTo(ppts[i].x, ppts[i].y, c, d);
    }

    tmp_ctx.quadraticCurveTo(
      ppts[i].x,
      ppts[i].y,
      ppts[i + 1].x,
      ppts[i + 1].y
    );
    tmp_ctx.stroke();
  };

  var onPaintCircle = function() {
    tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

    var x = (mouse.x + start_mouse.x) / 2;
    var y = (mouse.y + start_mouse.y) / 2;

    var radius =
      Math.max(
        Math.abs(mouse.x - start_mouse.x),
        Math.abs(mouse.y - start_mouse.y)
      ) / 2;

    tmp_ctx.beginPath();
    tmp_ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    tmp_ctx.stroke();
    tmp_ctx.closePath();
  };

  var onPaintLine = function() {
    tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

    tmp_ctx.beginPath();
    tmp_ctx.moveTo(start_mouse.x, start_mouse.y);
    tmp_ctx.lineTo(mouse.x, mouse.y);
    tmp_ctx.stroke();
    tmp_ctx.closePath();
  };

  var onPaintRect = function() {
    tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

    var x = Math.min(mouse.x, start_mouse.x);
    var y = Math.min(mouse.y, start_mouse.y);
    var width = Math.abs(mouse.x - start_mouse.x);
    var height = Math.abs(mouse.y - start_mouse.y);
    tmp_ctx.strokeRect(x, y, width, height);
  };

  function drawEllipse(ctx) {
    tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

    var x = Math.min(mouse.x, start_mouse.x);
    var y = Math.min(mouse.y, start_mouse.y);

    var w = Math.abs(mouse.x - start_mouse.x);
    var h = Math.abs(mouse.y - start_mouse.y);

    var kappa = 0.5522848,
      ox = (w / 2) * kappa, // control point offset horizontal
      oy = (h / 2) * kappa, // control point offset vertical
      xe = x + w, // x-end
      ye = y + h, // y-end
      xm = x + w / 2, // x-middle
      ym = y + h / 2; // y-middle

    ctx.beginPath();
    ctx.moveTo(x, ym);
    ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    ctx.closePath();
    ctx.stroke();
  }

  //Стерка
  var onErase = function() {
    ppts.push({ x: mouse.x, y: mouse.y });

    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.lineWidth = tmp_ctx.lineWidth;

    if (ppts.length < 3) {
      var b = ppts[0];
      ctx.beginPath();
      ctx.arc(b.x, b.y, ctx.lineWidth / 2, 0, Math.PI * 2, !0);
      ctx.fill();
      ctx.closePath();

      return;
    }

    ctx.beginPath();
    ctx.moveTo(ppts[0].x, ppts[0].y);

    for (var i = 1; i < ppts.length - 2; i++) {
      var c = (ppts[i].x + ppts[i + 1].x) / 2;
      var d = (ppts[i].y + ppts[i + 1].y) / 2;

      ctx.quadraticCurveTo(ppts[i].x, ppts[i].y, c, d);
    }

    ctx.quadraticCurveTo(ppts[i].x, ppts[i].y, ppts[i + 1].x, ppts[i + 1].y);
    ctx.stroke();
  };

  var getRandomOffset = function(radius) {
    var random_angle = Math.random() * (2 * Math.PI);
    var random_radius = Math.random() * radius;

    return {
      x: Math.cos(random_angle) * random_radius,
      y: Math.sin(random_angle) * random_radius
    };
  };
  var generateSprayParticles = function() {
    var density = tmp_ctx.lineWidth * 2;

    for (var i = 0; i < density; i++) {
      var offset = getRandomOffset(tmp_ctx.lineWidth);

      var x = mouse.x + offset.x;
      var y = mouse.y + offset.y;

      tmp_ctx.fillRect(x, y, 1, 1);
    }
  };

  var onCopy = function() {
    tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

    console.log(lastWidth);
    console.log(lastColor);

    tmp_ctx.globalAlpha = 1;
    tmp_ctx.strokeStyle = "black";
    tmp_ctx.lineWidth = 2;
    tmp_ctx.setLineDash([3, 15]);
    var x = Math.min(mouse.x, start_mouse.x);
    var y = Math.min(mouse.y, start_mouse.y);
    var width = Math.abs(mouse.x - start_mouse.x) + 1;
    var height = Math.abs(mouse.y - start_mouse.y) + 1;
    tmp_ctx.strokeRect(x, y, width, height);
    imgData = ctx.getImageData(x, y, width, height);
    whatPaste = 1;
  };

  var onText = function() {
    tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

    console.log(tmp_ctx);
    var x = Math.min(mouse.x, start_mouse.x);
    var y = Math.min(mouse.y, start_mouse.y);
    var width = Math.abs(mouse.x - start_mouse.x);
    var height = Math.abs(mouse.y - start_mouse.y);

    textarea.style.left = x + "px";
    textarea.style.top = y + "px";
    textarea.style.width = width + "px";
    textarea.style.height = height + "px";

    textarea.style.display = "block";
  };

  var onFill = function(opasity_alpha) {
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var width = imageData.width;
    var height = imageData.height;
    var stack = [[start_mouse.x, start_mouse.y]];
    var pixel = 0;
    var point = 0;

    while (stack.length > 0) {
      pixel = stack.pop();

      if (pixel[0] < 0 || pixel[0] >= width) continue;
      if (pixel[1] < 0 || pixel[1] >= height) continue;

      // Alpha
      point = pixel[1] * 4 * width + pixel[0] * 4 + 3;
      if (
        imageData.data[point] != opasity_alpha &&
        imageData.data[point] != 255 &&
        (imageData.data[point] > 255 || imageData.data[point] < 5)
      ) {
        imageData.data[point] = opasity_alpha;
        imageData.data[point - 3] = r; //Red
        imageData.data[point - 2] = g; //Green
        imageData.data[point - 1] = b; //Blue

        stack.push([pixel[0] - 1, pixel[1]]);
        stack.push([pixel[0] + 1, pixel[1]]);
        stack.push([pixel[0], pixel[1] - 1]);
        stack.push([pixel[0], pixel[1] + 1]);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  var onCopyRand = function() {
    ppts.push({ x: mouse.x, y: mouse.y });
    tmp_ctx.globalAlpha = 1;
    tmp_ctx.strokeStyle = "black";
    tmp_ctx.lineWidth = 2;
    if (ppts.length < 3) {
      var b = ppts[0];
      tmp_ctx.beginPath();
      tmp_ctx.arc(b.x, b.y, tmp_ctx.lineWidth / 2, 0, Math.PI * 2, !0);
      tmp_ctx.fill();
      tmp_ctx.closePath();

      return;
    }

    tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

    tmp_ctx.beginPath();
    tmp_ctx.moveTo(ppts[0].x, ppts[0].y);

    for (var i = 1; i < ppts.length - 2; i++) {
      var c = (ppts[i].x + ppts[i + 1].x) / 2;
      var d = (ppts[i].y + ppts[i + 1].y) / 2;

      tmp_ctx.quadraticCurveTo(ppts[i].x, ppts[i].y, c, d);
    }

    tmp_ctx.quadraticCurveTo(
      ppts[i].x,
      ppts[i].y,
      ppts[i + 1].x,
      ppts[i + 1].y
    );
    tmp_ctx.stroke();
    xcopy = ppts[i + 1].x;
    ycopy = ppts[i + 1].y;
  };

  var pasteRand = function(imgDataRand) {
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log("imgData = ", imgDataRand);
    var width = imageData.width;
    var height = imageData.height;
    var stack = [[xForCopy, yForCopy]];
    console.log("xForCopy = ", xForCopy);
    console.log("yForCopy = ", yForCopy);
    var dx = xForCopy - mouse.x;
    var dy = yForCopy - mouse.y;
    var point2 = yForCopy * 4 * width + xForCopy * 4 + 3;
    console.log("point2 = ", point2);
    console.log("data[point2] = ", imgDataRand.data[point2]);
    var pixel;
    var point = 0;
    var point1 = 0;

    while (stack.length > 0) {
      pixel = stack.pop();

      if (pixel[0] < 0 || pixel[0] >= width) continue;
      if (pixel[1] < 0 || pixel[1] >= height) continue;

      point = pixel[1] * 4 * width + pixel[0] * 4 + 3;
      point1 = (pixel[1] - dy) * 4 * width + (pixel[0] - dx) * 4 + 3;
      if (imgDataRand.data[point] != 255 && imgDataRand.data[point] < 1) {
        if (imgDataRand.data[point] == 0) {
          imgDataRand.data[point] = 2;
        }
        imageData.data[point1] = imgCopyRandMain.data[point];
        imageData.data[point1 - 1] = imgCopyRandMain.data[point - 1];
        imageData.data[point1 - 2] = imgCopyRandMain.data[point - 2];
        imageData.data[point1 - 3] = imgCopyRandMain.data[point - 3];

        stack.push([pixel[0] - 1, pixel[1]]);
        stack.push([pixel[0] + 1, pixel[1]]);
        stack.push([pixel[0], pixel[1] - 1]);
        stack.push([pixel[0], pixel[1] + 1]);
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  var hexToRgb = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null;
  };

  var onPaint = function() {
    console.log(alpha);
    if (tool == "brush") {
      onPaintBrush();
    } else if (tool == "circle") {
      onPaintCircle();
    } else if (tool == "line") {
      onPaintLine();
    } else if (tool == "rectangle") {
      onPaintRect();
    } else if (tool == "ellipse") {
      drawEllipse(tmp_ctx);
    } else if (tool == "eraser") {
      onErase();
    } else if (tool == "spray") {
      generateSprayParticles();
    } else if (tool == "copy") {
      onCopy();
    } else if (tool == "text") {
      onText();
    } else if (tool == "fill") {
      onFill(alpha);
    } else if (tool == "copyrand") {
      onCopyRand();
    } else if (tool == "no") {
    }
  };
})();
