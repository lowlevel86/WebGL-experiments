
function setCameraLens(viewStart, viewEnd, perspect, orthoMode, unitPerPix)
{
	var viewDist, zMv, zRsz, d, p, clipFront;

	viewDist = viewStart - viewEnd;

	if (orthoMode) // orthographic perspective
	{
		zRsz = viewDist / 2;
		zMv = (viewStart + viewEnd) / 2;
		perspect = 0;
	}
	else
	{
		// inverse of f(x) = y / (y + x) * x + y / (y - x) * x
		d = viewDist * viewDist;
		p = perspect * perspect;
		zRsz = (Math.sqrt(p*p + p*d) - p) / viewDist;

		clipFront = perspect / (perspect + zRsz) * zRsz;
		zMv = viewStart - clipFront;

		// one unit per pixel if z == 0
		if (unitPerPix) // view is moved such that one unit == one pixel
		zMv = 0;
	}
	
	return [perspect, zMv, zRsz]
}

function drawPoints(pts, vcolor)
{
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pts), gl.STATIC_DRAW);
	gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vcolor), gl.STATIC_DRAW);
	gl.vertexAttribPointer(colorAttribLocation, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);
	
	gl.drawArrays(gl.POINTS, 0, pts.length/3);
}

function drawLines(lines, vcolor)
{
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.STATIC_DRAW);
	gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vcolor), gl.STATIC_DRAW);
	gl.vertexAttribPointer(colorAttribLocation, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);
	
	gl.drawArrays(gl.LINES, 0, lines.length/3);
}

function drawTris(tris, vcolor)
{
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tris), gl.STATIC_DRAW);
	gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vcolor), gl.STATIC_DRAW);
	gl.vertexAttribPointer(colorAttribLocation, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);
	
	gl.drawArrays(gl.TRIANGLES, 0, tris.length/3);
}

var static_drawQuads = {indices:[]};
function drawQuads(quads, vcolor)
{
	var indices = static_drawQuads.indices;
	var drawBuffSz = quads.length/2;
	var vCnt = indices.length/6*4;
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
	
	while (indices.length < drawBuffSz)
	{
		indices.push(vCnt+0, vCnt+1, vCnt+2, vCnt+0, vCnt+2, vCnt+3);
		vCnt += 4;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quads), gl.STATIC_DRAW);
	gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vcolor), gl.STATIC_DRAW);
	gl.vertexAttribPointer(colorAttribLocation, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);
   gl.drawElements(gl.TRIANGLES, drawBuffSz, gl.UNSIGNED_SHORT, 0);
}

function rotVert(horiP, vertP, t)
{
   var h, v;
   var hUc, vUc;
   
   hUc = Math.cos(t);
   vUc = Math.sin(t);
   
   h = vertP * -vUc + horiP * hUc;
   v = horiP * vUc + vertP * hUc;

   return [h, v];
}

function modifyMesh(verts, mod_links, progState)
{
   var i, j, opCnt;
   var valList, xyzVal;
   var iPt = 0;
   
   for (i=0; i < verts.length; i+=3)
	{
      opCnt = progState.mod_seq[mod_links[iPt]].length;
      
      for (j=0; j < opCnt; j++)
      {
         if (progState.mod_seq[mod_links[iPt]][j] == 0) // move
         {
            valList = progState.mod_val[mod_links[iPt]];
            xyzVal = valList[j];
            verts[i+0] += xyzVal[0];
            verts[i+1] += xyzVal[1];
            verts[i+2] += xyzVal[2];
         }
         
         if (progState.mod_seq[mod_links[iPt]][j] == 1) // resize
         {
            valList = progState.mod_val[mod_links[iPt]];
            xyzVal = valList[j];
            verts[i+0] *= xyzVal[0];
            verts[i+1] *= xyzVal[1];
            verts[i+2] *= xyzVal[2];
         }
         
         if (progState.mod_seq[mod_links[iPt]][j] == 2) // rotate
         {
            valList = progState.mod_val[mod_links[iPt]];
            xyzVal = valList[j];
            [verts[i+1], verts[i+2]] = rotVert(verts[i+1], verts[i+2], xyzVal[0]);
            [verts[i+0], verts[i+2]] = rotVert(verts[i+0], verts[i+2], xyzVal[1]);
            [verts[i+0], verts[i+1]] = rotVert(verts[i+0], verts[i+1], xyzVal[2]);
         }
      }
      
      iPt++;
	}
}

// static variables for render.js
var points_inc;
var points_cnt;
var points_part;
var lines_inc;
var lines_cnt;
var lines_part;
var tris_inc;
var tris_cnt;
var tris_part;
var quads_inc;
var quads_cnt;
var quads_part;

var drawInterval;

function drawScene()
{
   var lensSettings = setCameraLens(progState.viewBgn, progState.viewEnd, progState.persp, progState.orth, progState.unitPerPix);
	gl.uniform3fv(gl.getUniformLocation(program, "view"), lensSettings);
	gl.enable(gl.DEPTH_TEST);

	if (quads_inc < quads_cnt)
	{
		quads_part = progState.vert_buff_size * 3;
		quads = progState.quads.slice(quads_inc, quads_inc+quads_part);
		quad_vcols = progState.quad_vcols.slice(quads_inc, quads_inc+quads_part);
      quad_mod_links = progState.quad_mod_links.slice(quads_inc, quads_inc+quads_part);
		quads_inc += quads_part;

      modifyMesh(quads, quad_mod_links, progState);
		drawQuads(quads, quad_vcols);
	}
	
	if (tris_inc < tris_cnt)
	{
		tris_part = progState.vert_buff_size * 3;
		tris = progState.tris.slice(tris_inc, tris_inc+tris_part);
		tri_vcols = progState.tri_vcols.slice(tris_inc, tris_inc+tris_part);
		tri_mod_links = progState.tri_mod_links.slice(tris_inc, tris_inc+tris_part);
		tris_inc += tris_part;

      modifyMesh(tris, tri_mod_links, progState);
		drawTris(tris, tri_vcols);
	}
	
	if (lines_inc < lines_cnt)
	{
		lines_part = progState.vert_buff_size * 3;
		lines = progState.lines.slice(lines_inc, lines_inc+lines_part);
		line_vcols = progState.line_vcols.slice(lines_inc, lines_inc+lines_part);
		line_mod_links = progState.line_mod_links.slice(lines_inc, lines_inc+lines_part);
		lines_inc += lines_part;

      modifyMesh(lines, line_mod_links, progState);
		drawLines(lines, line_vcols);
	}

	if (points_inc < points_cnt)
	{
		points_part = progState.vert_buff_size * 3;
		points = progState.points.slice(points_inc, points_inc+points_part);
		point_vcols = progState.point_vcols.slice(points_inc, points_inc+points_part);
		point_mod_links = progState.point_mod_links.slice(points_inc, points_inc+points_part);
		points_inc += points_part;

      modifyMesh(points, point_mod_links, progState);
		drawPoints(points, point_vcols);
	}

	if ((quads_inc >= quads_cnt) && (tris_inc >= tris_cnt) && (lines_inc >= lines_cnt) && (points_inc >= points_cnt))
   clearInterval(drawInterval);

   var lens2dSettings = setCameraLens(progState.viewBgn, progState.viewEnd, progState.persp, true, progState.unitPerPix);
	gl.uniform3fv(gl.getUniformLocation(program, "view"), lens2dSettings);
	gl.disable(gl.DEPTH_TEST);
	
   drawPoints(progState.points_HUD, progState.point_vcols_HUD);
   drawLines(progState.lines_HUD, progState.line_vcols_HUD);
   drawTris(progState.tris_HUD, progState.tri_vcols_HUD);
   drawQuads(progState.quads_HUD, progState.quad_vcols_HUD);
}

function renderScene(progState)
{
	points_inc = 0;
	points_cnt = progState.points.length;
	lines_inc = 0;
	lines_cnt = progState.lines.length;
	tris_inc = 0;
	tris_cnt = progState.tris.length;
	quads_inc = 0;
	quads_cnt = progState.quads.length;

   modifyMesh(progState.points_HUD, progState.point_mod_links_HUD, progState);
   modifyMesh(progState.lines_HUD, progState.line_mod_links_HUD, progState);
   modifyMesh(progState.tris_HUD, progState.tri_mod_links_HUD, progState);
   modifyMesh(progState.quads_HUD, progState.quad_mod_links_HUD, progState);
   
   clearInterval(drawInterval);
	drawScene();
   drawInterval = setInterval(drawScene, progState.draw_buff_interval);
}
