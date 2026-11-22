import * as THREE from "three";
type Paint = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
function canvasTexture(width: number, height: number, paint: Paint) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is unavailable for the Chisel room artwork.");
  paint(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
/** Nine quiet, geometric prints from the approved Chisel room study. */
export function makeChiselPosterTexture(index: number) {
  return canvasTexture(480, 560, (ctx, width, height) => {
    ctx.fillStyle = "#f8f6ef";
    ctx.fillRect(0, 0, width, height);
    const navy = "#3c5d85";
    const coral = "#c96960";
    const sage = "#849a83";
    const mist = "#b9c9cf";
    ctx.save();
    ctx.translate(width / 2, height / 2);
    if (index === 0) {
      ctx.fillStyle = coral;
      [[0, -72], [72, 0], [0, 72], [-72, 0]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, 62, 66, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (index === 1) {
      ctx.fillStyle = navy;
      ctx.fillRect(-155, -205, 310, 410);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = "#f5f2e8";
        ctx.beginPath();
        ctx.arc(0, -125 + i * 82, 66, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = navy;
        ctx.beginPath();
        ctx.arc(0, -140 + i * 82, 66, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (index === 2) {
      ctx.fillStyle = sage;
      [-105, -35, 35, 105].forEach((x, i) => {
        const y = 15 - (i % 2) * 42;
        const w = 40;
        const h = 150 + (i % 2) * 75;
        ctx.beginPath();
        ctx.moveTo(x - w / 2 + 18, y - h / 2);
        ctx.lineTo(x + w / 2 - 18, y - h / 2);
        ctx.quadraticCurveTo(x + w / 2, y - h / 2, x + w / 2, y - h / 2 + 18);
        ctx.lineTo(x + w / 2, y + h / 2);
        ctx.lineTo(x - w / 2, y + h / 2);
        ctx.lineTo(x - w / 2, y - h / 2 + 18);
        ctx.quadraticCurveTo(x - w / 2, y - h / 2, x - w / 2 + 18, y - h / 2);
        ctx.closePath();
        ctx.fill();
      });
    } else if (index === 3) {
      ctx.strokeStyle = mist;
      ctx.lineWidth = 15;
      for (let y = -110; y < 150; y += 55) {
        ctx.beginPath();
        for (let x = -190; x <= 190; x += 4) {
          const yy = y + Math.sin(x / 26) * 13;
          if (x === -190) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
    } else if (index === 4) {
      ctx.strokeStyle = "#93a7b7";
      ctx.lineWidth = 2;
      for (let i = 0; i < 44; i++) {
        const angle = i * Math.PI / 22;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 12, Math.sin(angle) * 12);
        ctx.lineTo(Math.cos(angle) * 160, Math.sin(angle) * 160);
        ctx.stroke();
      }
      ctx.fillStyle = navy;
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
    } else if (index === 5) {
      ctx.fillStyle = coral;
      ctx.beginPath();
      ctx.moveTo(-160, 170);
      ctx.lineTo(-160, 55);
      ctx.lineTo(-65, 55);
      ctx.lineTo(-65, -35);
      ctx.lineTo(24, -35);
      ctx.lineTo(24, -145);
      ctx.lineTo(160, -145);
      ctx.lineTo(160, 170);
      ctx.closePath();
      ctx.fill();
    } else if (index === 6) {
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = "#d47769";
      ctx.beginPath();
      ctx.arc(-42, -5, 94, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6684a5";
      ctx.beginPath();
      ctx.arc(42, 38, 94, 0, Math.PI * 2);
      ctx.fill();
    } else if (index === 7) {
      ctx.strokeStyle = sage;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(-6, 174);
      ctx.quadraticCurveTo(25, 0, 10, -155);
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 ? sage : "#a5b39a";
        ctx.beginPath();
        ctx.ellipse(i % 2 ? 46 : -43, 122 - i * 32, 39, 15, i % 2 ? -0.45 : 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = navy;
      ctx.beginPath();
      ctx.moveTo(-130, 170);
      ctx.lineTo(-130, -15);
      ctx.quadraticCurveTo(-130, -145, 0, -145);
      ctx.quadraticCurveTo(130, -145, 130, -15);
      ctx.lineTo(130, 170);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#f8f6ef";
      ctx.beginPath();
      ctx.moveTo(-70, 170);
      ctx.lineTo(-70, -8);
      ctx.quadraticCurveTo(-70, -70, 0, -70);
      ctx.quadraticCurveTo(70, -70, 70, -8);
      ctx.lineTo(70, 170);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  });
}
/** Diagrammatic whiteboard drawing used in the standalone model study. */
export function makeChiselWhiteboardTexture() {
  return canvasTexture(960, 520, (ctx, width, height) => {
    ctx.fillStyle = "#faf9f5";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(92,118,141,.35)";
    ctx.lineWidth = 2;
    for (let x = 70; x < width; x += 90) {
      ctx.beginPath();
      ctx.moveTo(x, 15);
      ctx.lineTo(x, height - 15);
      ctx.stroke();
    }
    for (let y = 70; y < height; y += 90) {
      ctx.beginPath();
      ctx.moveTo(15, y);
      ctx.lineTo(width - 15, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "#72889b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(160, 150, 70, 70, 0, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.ellipse(160, 150, 70, 13, i * Math.PI / 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.48;
    ctx.fillStyle = "#d07669";
    [[405, 138], [465, 138], [435, 190]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 53, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#b7685c";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(820, 360);
    ctx.lineTo(820, 110);
    ctx.lineTo(880, 154);
    ctx.moveTo(820, 184);
    ctx.lineTo(768, 148);
    ctx.moveTo(820, 230);
    ctx.lineTo(880, 214);
    ctx.stroke();
    ctx.strokeStyle = "#a4b7c2";
    ctx.lineWidth = 5;
    for (let y = 320; y < 465; y += 31) {
      ctx.beginPath();
      ctx.moveTo(70, y);
      ctx.bezierCurveTo(160, y - 34, 218, y + 34, 315, y);
      ctx.stroke();
    }
  });
}
export function makeChiselCorkTexture() {
  return canvasTexture(960, 520, (ctx, width, height) => {
    ctx.fillStyle = "#b9855d";
    ctx.fillRect(0, 0, width, height);
    let seed = 41;
    const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < 9800; i++) {
      const shade = 118 + Math.floor(random() * 55);
      ctx.fillStyle = "rgba(" + shade + "," + Math.floor(shade * 0.7) + "," +
        Math.floor(shade * 0.5) + "," + (0.055 + random() * 0.075) + ")";
      ctx.fillRect(random() * width, random() * height, 0.7 + random() * 2.2, 0.7 + random() * 2.2);
    }
    for (let i = 0; i < 150; i++) {
      const x = random() * width;
      const y = random() * height;
      ctx.strokeStyle = random() > 0.5 ? "rgba(245,223,193,.12)" : "rgba(82,54,36,.08)";
      ctx.lineWidth = 0.7 + random() * 1.2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 2 + random() * 8, y - 1 + random() * 3);
      ctx.stroke();
    }
    const light = ctx.createLinearGradient(0, 0, width, height);
    light.addColorStop(0, "rgba(255,239,216,.10)");
    light.addColorStop(0.55, "rgba(255,255,255,0)");
    light.addColorStop(1, "rgba(68,46,32,.09)");
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, width, height);
  });
}
export type ChiselNoteStyle = "city" | "botanical" | "blueprint" | "coral";
export function makeChiselNoteTexture(style: ChiselNoteStyle) {
  return canvasTexture(480, 320, (ctx, width, height) => {
    const paper = style === "blueprint" ? "#eef0e9" : style === "coral" ? "#f0e4d8" : "#f5f2e8";
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, width, height);
    let seed = 5701 + style.length * 97;
    const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < 1100; i++) {
      ctx.fillStyle = random() > 0.5 ? "rgba(255,255,255,.13)" : "rgba(98,86,68,.035)";
      ctx.fillRect(random() * width, random() * height, 1 + random() * 2, 0.7 + random() * 1.4);
    }
    if (style === "city") {
      const sky = ctx.createLinearGradient(20, 18, 30, 252);
      sky.addColorStop(0, "#dce6e4");
      sky.addColorStop(1, "#b8c8c5");
      ctx.fillStyle = sky;
      ctx.fillRect(26, 24, 428, 220);
      ctx.fillStyle = "rgba(250,248,237,.46)";
      ctx.fillRect(26, 24, 428, 220);
      const buildings = [[42, 118, 66, 126], [122, 76, 72, 168], [212, 102, 86, 142], [318, 52, 54, 192], [386, 94, 52, 150]];
      buildings.forEach(([x, y, buildingWidth, buildingHeight], i) => {
        const colors: readonly string[] = ["#a9b7b2", "#c2c6ba", "#99aaa7", "#b8b4a8", "#a3b1aa"];
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(x, y, buildingWidth, buildingHeight);
        ctx.fillStyle = "rgba(246,239,220,.62)";
        for (let wy = y + 13; wy < y + buildingHeight - 8; wy += 24) {
          for (let wx = x + 10; wx < x + buildingWidth - 6; wx += 17) ctx.fillRect(wx, wy, 5, 8);
        }
      });
      ctx.fillStyle = "#a57d60";
      ctx.fillRect(26, 232, 428, 12);
      ctx.fillStyle = "rgba(52,63,61,.58)";
      ctx.fillRect(28, 271, 132, 4);
      ctx.fillRect(28, 284, 86, 3);
    } else if (style === "botanical") {
      ctx.strokeStyle = "#778c78";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(235, 278);
      ctx.bezierCurveTo(203, 213, 269, 135, 226, 44);
      ctx.stroke();
      for (let i = 0; i < 7; i++) {
        const y = 65 + i * 29;
        const side = i % 2 ? 1 : -1;
        ctx.fillStyle = i % 3 === 0 ? "#97a789" : "#718b78";
        ctx.beginPath();
        ctx.ellipse(232 + side * (20 + (i % 2) * 8), y, 31, 11, side * 0.46, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(245,242,232,.56)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(232, y);
        ctx.lineTo(232 + side * 32, y - 4);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(56,70,67,.5)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(302, 85 + i * 25);
        ctx.lineTo(425 - (i % 2) * 22, 85 + i * 25);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(56,63,58,.55)";
      ctx.fillRect(302, 208, 96, 4);
      ctx.fillRect(302, 222, 65, 3);
    } else if (style === "blueprint") {
      ctx.strokeStyle = "rgba(86,116,135,.38)";
      ctx.lineWidth = 1;
      for (let x = 31; x < width; x += 28) {
        ctx.beginPath();
        ctx.moveTo(x, 22);
        ctx.lineTo(x, 250);
        ctx.stroke();
      }
      for (let y = 24; y < 252; y += 28) {
        ctx.beginPath();
        ctx.moveTo(24, y);
        ctx.lineTo(width - 24, y);
        ctx.stroke();
      }
      ctx.strokeStyle = "#718b98";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(157, 132, 72, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(157, 46);
      ctx.lineTo(157, 218);
      ctx.moveTo(71, 132);
      ctx.lineTo(243, 132);
      ctx.stroke();
      ctx.strokeStyle = "#bf796a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(275, 209);
      ctx.bezierCurveTo(320, 120, 354, 205, 428, 72);
      ctx.stroke();
      ctx.fillStyle = "rgba(53,68,69,.55)";
      ctx.fillRect(284, 250, 128, 4);
      ctx.fillRect(284, 263, 88, 3);
    } else {
      ctx.fillStyle = "#d47e70";
      ctx.beginPath();
      ctx.arc(112, 111, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#748f84";
      ctx.beginPath();
      ctx.arc(178, 148, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(54,66,63,.48)";
      ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(254, 73 + i * 32);
        ctx.lineTo(431 - (i % 2) * 37, 73 + i * 32);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(255,255,255,.5)";
      ctx.fillRect(44, 220, 390, 22);
    }
  });
}
/** Classic rainbow Apple badge for the lower-left face of the Macintosh case. */
export function makeMacintoshBadgeTexture() {
  return canvasTexture(128, 128, (ctx) => {
    const roundRect = (x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    roundRect(13, 13, 102, 102, 13);
    ctx.fillStyle = "#d8c9ad";
    ctx.fill();
    ctx.strokeStyle = "rgba(100, 82, 60, 0.52)";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    roundRect(17, 17, 94, 94, 10);
    ctx.strokeStyle = "rgba(255, 250, 233, 0.58)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    // Leaf.
    ctx.moveTo(65, 42);
    ctx.bezierCurveTo(64, 28, 76, 18, 91, 17);
    ctx.bezierCurveTo(92, 31, 81, 41, 66, 44);
    ctx.closePath();
    // Apple body.
    ctx.moveTo(62, 50);
    ctx.bezierCurveTo(51, 39, 35, 42, 28, 56);
    ctx.bezierCurveTo(18, 76, 31, 104, 47, 109);
    ctx.bezierCurveTo(54, 111, 60, 107, 68, 107);
    ctx.bezierCurveTo(76, 107, 82, 112, 90, 108);
    ctx.bezierCurveTo(103, 102, 114, 82, 115, 70);
    ctx.bezierCurveTo(103, 68, 97, 58, 98, 49);
    ctx.bezierCurveTo(99, 42, 105, 36, 113, 32);
    ctx.bezierCurveTo(102, 22, 88, 25, 78, 31);
    ctx.bezierCurveTo(71, 35, 66, 42, 62, 50);
    ctx.closePath();
    // The characteristic bite is an even-odd cutout in the right edge.
    ctx.moveTo(106, 55);
    ctx.arc(105, 62, 8.5, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip("evenodd");

    const bands = ["#6c914e", "#d6bd4d", "#e38d45", "#d45850", "#9b5888", "#5278a3"];
    bands.forEach((color, index) => {
      ctx.fillStyle = color;
      ctx.fillRect(16, 34 + index * 13, 98, 13.2);
    });
    ctx.restore();
  });
}
/** Key grid for the compact ivory keyboard beside the Macintosh. */
export function makeChiselKeyboardTexture() {
  return canvasTexture(1024, 320, (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    const gap = 9;
    const keyHeight = 42;
    const top = 28;
    const rows: Array<Array<[string, number]>> = [
      [["esc", 1.4], ["1", 1], ["2", 1], ["3", 1], ["4", 1], ["5", 1], ["6", 1], ["7", 1], ["8", 1], ["9", 1], ["0", 1], ["−", 1], ["+", 1], ["delete", 1.6]],
      [["tab", 1.6], ["Q", 1], ["W", 1], ["E", 1], ["R", 1], ["T", 1], ["Y", 1], ["U", 1], ["I", 1], ["O", 1], ["P", 1], ["[", 1], ["]", 1], ["|", 1.4]],
      [["caps", 1.8], ["A", 1], ["S", 1], ["D", 1], ["F", 1], ["G", 1], ["H", 1], ["J", 1], ["K", 1], ["L", 1], [";", 1], ["'", 1], ["return", 1.8]],
      [["shift", 2.2], ["Z", 1], ["X", 1], ["C", 1], ["V", 1], ["B", 1], ["N", 1], ["M", 1], [",", 1], [".", 1], ["/", 1], ["shift", 2.2]],
      [["fn", 1.1], ["ctrl", 1.1], ["⌥", 1.1], ["⌘", 1.3], ["", 5.2], ["⌘", 1.3], ["⌥", 1.1], ["←", 1.1], ["↑↓", 1.1]],
    ];
    const maxUnits = 15.2;
    const available = width - 52;
    const unit = (available - gap * (maxUnits - 1)) / maxUnits;
    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    rows.forEach((row, rowIndex) => {
      const rowUnits = row.reduce((sum, [, units]) => sum + units, 0);
      const rowWidth = rowUnits * unit + gap * (row.length - 1);
      let x = (width - rowWidth) / 2;
      const y = top + rowIndex * (keyHeight + 10);
      row.forEach(([label, units]) => {
        const keyWidth = units * unit;
        ctx.fillStyle = "rgba(80,79,73,.18)";
        roundRect(x, y + 3, keyWidth, keyHeight, 7);
        ctx.fill();
        ctx.fillStyle = label ? "#f7f5ef" : "#f4f2eb";
        roundRect(x, y, keyWidth, keyHeight - 2, 7);
        ctx.fill();
        if (label) {
          ctx.fillStyle = "#747a74";
          ctx.font = label.length > 3 ? "16px ui-monospace, monospace" : "19px ui-monospace, monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, x + keyWidth / 2, y + keyHeight / 2 - 1);
        }
        x += keyWidth + gap;
      });
    });
  });
}

/** Soft daylight through the window; drawn locally so it works offline. */
export function makeChiselWindowTexture() {
  return canvasTexture(768, 1024, (ctx, width, height) => {
    const sky = ctx.createLinearGradient(0, 0, width, height);
    sky.addColorStop(0, "#dcebf0");
    sky.addColorStop(0.5, "#eef0e5");
    sky.addColorStop(1, "#c7d9c3");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(249,248,237,.7)";
    ctx.fillRect(30, 52, 280, 430);
    ctx.fillStyle = "#d8d8ce";
    ctx.fillRect(420, 290, 310, 620);
    ctx.fillStyle = "#b8c4c0";
    ctx.fillRect(445, 324, 263, 560);
    for (let row = 0; row < 5; row++) {
      for (let column = 0; column < 3; column++) {
        ctx.fillStyle = row % 2 ? "#e5e9e2" : "#cddbd6";
        ctx.fillRect(460 + column * 80, 350 + row * 96, 47, 55);
      }
    }
    const branches = [[65, 220, 380, 760], [35, 420, 300, 760], [270, 120, 510, 660], [680, 180, 455, 720], [575, 40, 400, 560]];
    branches.forEach(([x1, y1, x2, y2]) => {
      ctx.strokeStyle = "rgba(104,110,80,.5)";
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo((x1 + x2) / 2 + 35, y2 * 0.35, x2, y2);
      ctx.stroke();
    });
    const points = [[40, 115], [135, 260], [212, 175], [70, 490], [290, 365], [520, 170], [680, 315], [545, 515], [350, 555], [165, 625], [610, 710], [735, 95], [390, 100], [258, 715], [68, 315], [450, 280], [625, 430], [320, 300], [475, 635], [125, 70]];
    points.forEach(([x, y], i) => {
      for (let j = 0; j < 7; j++) {
        const dx = ((j * 47 + i * 19) % 90) - 45;
        const dy = ((j * 31 + i * 13) % 82) - 41;
        const leafColors: readonly string[] = ["rgba(94,126,88,.42)", "rgba(157,167,105,.4)", "rgba(193,179,109,.34)"];
        ctx.fillStyle = leafColors[j % leafColors.length];
        ctx.beginPath();
        ctx.ellipse(x + dx, y + dy, 18 + (j % 3) * 3, 7 + (j % 2) * 2, -0.5 + j * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  });
}
