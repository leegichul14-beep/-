const pptxgen = require("pptxgenjs");

let pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.title = '이랜드리테일 체육대회 포스터';

let slide = pres.addSlide();

slide.background = { color: "0D1B2A" };

// 배경 사선 장식
[
  { x:-1.2, y:-1, w:2.2, h:8.5, rot:18 },
  { x: 1.1, y:-1, w:0.4, h:8.5, rot:18 },
  { x: 8.7, y:-1, w:2.2, h:8.5, rot:18 },
  { x:10.3, y:-1, w:0.4, h:8.5, rot:18 },
].forEach(s => {
  slide.addShape(pres.shapes.RECTANGLE, {
    x:s.x, y:s.y, w:s.w, h:s.h, rotate:s.rot,
    fill:{color:"CC0011", transparency:80},
    line:{color:"CC0011", transparency:80}
  });
});

// 상/하 빨간 바
slide.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:10, h:0.22, fill:{color:"CC0011"}, line:{color:"CC0011"} });
slide.addShape(pres.shapes.RECTANGLE, { x:0, y:5.4, w:10, h:0.22, fill:{color:"CC0011"}, line:{color:"CC0011"} });

// 이랜드리테일 로고 (흰 배경 패널 위에)
slide.addShape(pres.shapes.RECTANGLE, {
  x:0.22, y:0.24, w:2.85, h:0.65,
  fill:{color:"FFFFFF", transparency:10}, line:{color:"FFFFFF", transparency:40}
});
slide.addImage({
  path:"https://www.elandretail.com/hom/images/common/h1_elandretail.png",
  x:0.3, y:0.3, w:2.5, h:0.52
});

// 브랜드 로고 (흰 배경 패널)
slide.addShape(pres.shapes.RECTANGLE, {
  x:6.3, y:0.24, w:3.55, h:0.65,
  fill:{color:"FFFFFF", transparency:10}, line:{color:"FFFFFF", transparency:40}
});
[
  { path:"https://www.elandretail.com/pub/hom/images/cont/logo_company01.png", x:6.4 },
  { path:"https://www.elandretail.com/pub/hom/images/cont/logo_company03.png", x:7.55 },
  { path:"https://www.elandretail.com/pub/hom/images/cont/logo_company02.png", x:8.7 },
].forEach(l => {
  slide.addImage({ path:l.path, x:l.x, y:0.28, w:1.1, h:0.52 });
});

// ══ 왼쪽 타이포 카드 ══
// 카드: x=0.4, y=0.9, w=4.9, h=4.35
// 빨간 char 박스: w=0.9 → 검정 박스 시작: x=0.4+0.2+0.9=1.5 → w=3.7
const CX=0.4, CY=0.9, CW=4.9, CH=4.35;
const RED_W=0.9, BLACK_X=CX+0.2+RED_W, BLACK_W=CW-RED_W-0.3;

slide.addShape(pres.shapes.RECTANGLE, {
  x:CX, y:CY, w:CW, h:CH,
  fill:{color:"FFFFFF"}, line:{color:"E0E0E0", width:1},
  shadow:{type:"outer", blur:28, offset:7, angle:140, color:"000000", opacity:0.45}
});
slide.addShape(pres.shapes.RECTANGLE, {
  x:CX, y:CY, w:0.16, h:CH,
  fill:{color:"CC0011"}, line:{color:"CC0011"}
});

// 행 구분선
const ROW_H = 0.95;
const ROW_Y = [0.97, 1.97, 2.97, 3.97];
ROW_Y.slice(1).forEach(ry => {
  slide.addShape(pres.shapes.LINE, {
    x:CX+0.2, y:ry-0.05, w:CW-0.25, h:0,
    line:{color:"EBEBEB", width:0.75}
  });
});

// 행 데이터
const rows = [
  { red:"유", black:"통",          rf:58, bf:58 },
  { red:"체", black:"육대회",     rf:58, bf:58 },
  { red:"일", black:"상으로부터", rf:52, bf:40 },
  { red:"탈", black:"출",          rf:58, bf:58 },
];

rows.forEach((row, i) => {
  const ry = ROW_Y[i];
  slide.addText(row.red, {
    x:CX+0.22, y:ry, w:RED_W, h:ROW_H,
    fontSize:row.rf, fontFace:"Arial Black",
    color:"CC0011", bold:true,
    align:"center", valign:"middle", margin:0
  });
  slide.addText(row.black, {
    x:BLACK_X, y:ry, w:BLACK_W, h:ROW_H,
    fontSize:row.bf, fontFace:"Arial Black",
    color:"1A1A1A", bold:true,
    align:"left", valign:"middle", margin:0,
    autoFit:true
  });
});

// ══ 오른쪽 브랜드 콜라주 ══
// 상단 (NC)
slide.addShape(pres.shapes.RECTANGLE, {
  x:5.5, y:0.9, w:4.15, h:2.05,
  fill:{color:"162D4A"}, line:{color:"CC0011", width:2}
});
slide.addImage({
  path:"https://www.elandretail.com/pub/hom/images/cont/logo_company01.png",
  x:5.7, y:1.08, w:2.7, h:1.0, sizing:{type:"contain", w:2.7, h:1.0}
});
slide.addText("NC백화점", {
  x:5.5, y:2.0, w:4.15, h:0.65,
  fontSize:17, fontFace:"Arial", color:"7AAFC8",
  bold:true, align:"center", valign:"middle", margin:0
});

// 좌하 (뉴코아)
slide.addShape(pres.shapes.RECTANGLE, {
  x:5.5, y:3.1, w:2.0, h:2.05,
  fill:{color:"162D4A"}, line:{color:"CC0011", width:2}
});
slide.addImage({
  path:"https://www.elandretail.com/pub/hom/images/cont/logo_company03.png",
  x:5.6, y:3.48, w:1.8, h:0.72, sizing:{type:"contain", w:1.8, h:0.72}
});
slide.addText("뉴코아아울렛", {
  x:5.5, y:4.38, w:2.0, h:0.52,
  fontSize:12, fontFace:"Arial", color:"7AAFC8",
  bold:true, align:"center", valign:"middle", margin:0
});

// 우하 (2001)
slide.addShape(pres.shapes.RECTANGLE, {
  x:7.6, y:3.1, w:2.05, h:2.05,
  fill:{color:"162D4A"}, line:{color:"CC0011", width:2}
});
slide.addImage({
  path:"https://www.elandretail.com/pub/hom/images/cont/logo_company02.png",
  x:7.68, y:3.48, w:1.88, h:0.72, sizing:{type:"contain", w:1.88, h:0.72}
});
slide.addText("2001아울렛", {
  x:7.6, y:4.38, w:2.05, h:0.52,
  fontSize:12, fontFace:"Arial", color:"7AAFC8",
  bold:true, align:"center", valign:"middle", margin:0
});

// 하단 풋터
slide.addShape(pres.shapes.RECTANGLE, {
  x:0, y:5.08, w:10, h:0.32,
  fill:{color:"CC0011", transparency:12}, line:{color:"CC0011"}
});
slide.addText("🏆  이랜드리테일 전사 체육대회  |  일상으로부터의 탈출  |  ELAND RETAIL SPORTS DAY  🏆", {
  x:0, y:5.08, w:10, h:0.32,
  fontSize:12, fontFace:"Arial", color:"FFFFFF",
  bold:true, align:"center", valign:"middle", margin:0
});

pres.writeFile({ fileName:"C:\\Users\\LEE_GICHUL\\Desktop\\새 폴더\\이랜드리테일_체육대회_포스터.pptx" })
  .then(() => console.log("✅ 완료"))
  .catch(e => console.error("❌", e));
