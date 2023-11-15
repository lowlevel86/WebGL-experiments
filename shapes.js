function getPoint()
{
    return [0.0, 0.0, 0.0];
}

function getPlane(subdivs, size)
{
    var i, x, y;
    var quads = [];
    var planeWdth = subdivs + 1
    var planeCenter = planeWdth / 2;
    var planeSz = size / planeWdth;

    for (y=0; y < planeWdth; y++)
    for (x=0; x < planeWdth; x++)
    quads.push(0+x,1+y,0, 1+x,1+y,0, 1+x,0+y,0, 0+x,0+y,0);

    // move x
    for (i=0; i < quads.length; i+=3)
    quads[i] -= planeCenter;

    // move y
    for (i=1; i < quads.length; i+=3)
    quads[i] -= planeCenter;

    // resize
    for (i=0; i < quads.length; i++)
    quads[i] *= planeSz;

    return quads;
}

function getDisc(slices, size)
{
    var i;
    var tris = [];

    for (i=0; i < slices; i++)
    {
        tris.push(Math.sin(Math.PI*2/slices*i) * size,
                  Math.cos(Math.PI*2/slices*i) * size,
                  0,
                  Math.sin(Math.PI*2/slices*(i+1)) * size,
                  Math.cos(Math.PI*2/slices*(i+1)) * size,
                  0,
                  0,0,0);
    }
    
    return tris;
}

function getQuadSphere(subdivs, size)
{
    var i, x, y;
    var quads = [];
    var planeWdth = subdivs + 1
    var planeCenter = planeWdth / 2;
    var planeSz = size / planeWdth;
    var planeQuadSz = planeWdth * planeWdth * 12;
    
    // x and y
    for (y=0; y < planeWdth; y++)
    for (x=0; x < planeWdth; x++)
    quads.push(0+x,1+y,0, 1+x,1+y,0, 1+x,0+y,0, 0+x,0+y,0);

    for (i=0; i < planeQuadSz; i+=3)// move x
    quads[i] -= planeCenter;
    for (i=1; i < planeQuadSz; i+=3)// move y
    quads[i] -= planeCenter;
    for (i=2; i < planeQuadSz; i+=3)// move z
    quads[i] += planeCenter;

    for (y=0; y < planeWdth; y++)
    for (x=0; x < planeWdth; x++)
    quads.unshift(0+x,0+y,0, 1+x,0+y,0, 1+x,1+y,0, 0+x,1+y,0);

    for (i=0; i < planeQuadSz; i+=3)// move x
    quads[i] -= planeCenter;
    for (i=1; i < planeQuadSz; i+=3)// move y
    quads[i] -= planeCenter;
    for (i=2; i < planeQuadSz; i+=3)// move z
    quads[i] -= planeCenter;

    // x and z
    for (y=0; y < planeWdth; y++)
    for (x=0; x < planeWdth; x++)
    quads.unshift(0+x,0,1+y, 1+x,0,1+y, 1+x,0,0+y, 0+x,0,0+y);

    for (i=0; i < planeQuadSz; i+=3)// move x
    quads[i] -= planeCenter;
    for (i=1; i < planeQuadSz; i+=3)// move y
    quads[i] -= planeCenter;
    for (i=2; i < planeQuadSz; i+=3)// move z
    quads[i] -= planeCenter;

    for (y=0; y < planeWdth; y++)
    for (x=0; x < planeWdth; x++)
    quads.unshift(0+x,0,0+y, 1+x,0,0+y, 1+x,0,1+y, 0+x,0,1+y);

    for (i=0; i < planeQuadSz; i+=3)// move x
    quads[i] -= planeCenter;
    for (i=1; i < planeQuadSz; i+=3)// move y
    quads[i] += planeCenter;
    for (i=2; i < planeQuadSz; i+=3)// move z
    quads[i] -= planeCenter;

    // z and y
    for (y=0; y < planeWdth; y++)
    for (x=0; x < planeWdth; x++)
    quads.unshift(0,0+x,1+y, 0,1+x,1+y, 0,1+x,0+y, 0,0+x,0+y);

    for (i=0; i < planeQuadSz; i+=3)// move x
    quads[i] += planeCenter;
    for (i=1; i < planeQuadSz; i+=3)// move y
    quads[i] -= planeCenter;
    for (i=2; i < planeQuadSz; i+=3)// move z
    quads[i] -= planeCenter;

    for (y=0; y < planeWdth; y++)
    for (x=0; x < planeWdth; x++)
    quads.unshift(0,0+x,0+y, 0,1+x,0+y, 0,1+x,1+y, 0,0+x,1+y);

    for (i=0; i < planeQuadSz; i+=3)// move x
    quads[i] -= planeCenter;
    for (i=1; i < planeQuadSz; i+=3)// move y
    quads[i] -= planeCenter;
    for (i=2; i < planeQuadSz; i+=3)// move z
    quads[i] -= planeCenter;

    // make spherical
    var lgthA, lgthB;
    for (i=0; i < quads.length; i+=3)
    {
        lgthA = Math.sqrt(quads[i+0]*quads[i+0] + quads[i+2]*quads[i+2]);
        lgthB = Math.sqrt(lgthA*lgthA + quads[i+1]*quads[i+1]);
        quads[i+0] = quads[i+0] * planeCenter / lgthB;
        quads[i+2] = quads[i+2] * planeCenter / lgthB;
        quads[i+1] = quads[i+1] * planeCenter / lgthB;
    }

    // resize
    for (i=0; i < quads.length; i++)
    quads[i] *= planeSz;

    return quads;
}

function getUVSphere(rings, slices, size)
{
    var i, j;
    var tris = [];
    var quads = [];
    var height = [];
    var distance = []; // distance from the z-axis

    for (i=1; i <= rings; i++)
    {
        distance.push(Math.sin(Math.PI/(rings+1)*i) * size);
        height.push(Math.cos(Math.PI/(rings+1)*i) * size);
    }

    // top
    for (i=0; i < slices; i++)
    {
        tris.push(Math.sin(Math.PI*2/slices*i) * distance[0],
                  Math.cos(Math.PI*2/slices*i) * distance[0],
                  height[0],
                  Math.sin(Math.PI*2/slices*(i+1)) * distance[0],
                  Math.cos(Math.PI*2/slices*(i+1)) * distance[0],
                  height[0],
                  0, 0, size);
    }

    // middle
    if (rings > 1)
    for (j=0; j < rings-1; j++)
    for (i=0; i < slices; i++)
    {
        quads.push(Math.sin(Math.PI*2/slices*(i+1)) * distance[j],
                   Math.cos(Math.PI*2/slices*(i+1)) * distance[j],
                   height[j],
                   Math.sin(Math.PI*2/slices*i) * distance[j],
                   Math.cos(Math.PI*2/slices*i) * distance[j],
                   height[j],
                   Math.sin(Math.PI*2/slices*i) * distance[j+1],
                   Math.cos(Math.PI*2/slices*i) * distance[j+1],
                   height[j+1],
                   Math.sin(Math.PI*2/slices*(i+1)) * distance[j+1],
                   Math.cos(Math.PI*2/slices*(i+1)) * distance[j+1],
                   height[j+1]);
    }

    // bottom
    for (i=0; i < slices; i++)
    {
        tris.push(Math.sin(Math.PI*2/slices*(i+1)) * distance[distance.length-1],
                  Math.cos(Math.PI*2/slices*(i+1)) * distance[distance.length-1],
                  height[height.length-1],
                  Math.sin(Math.PI*2/slices*i) * distance[distance.length-1],
                  Math.cos(Math.PI*2/slices*i) * distance[distance.length-1],
                  height[height.length-1],
                  0, 0, -size);
    }
    
    return [tris, quads];
}

function getQuadEdges(quads)
{
    var i;
    var lines = [];

    for (i=0; i < quads.length; i+=12)
    {
        lines.push(quads[i+0], quads[i+1], quads[i+2], quads[i+3], quads[i+4], quads[i+5]);
        lines.push(quads[i+3], quads[i+4], quads[i+5], quads[i+6], quads[i+7], quads[i+8]);
        lines.push(quads[i+6], quads[i+7], quads[i+8], quads[i+9], quads[i+10], quads[i+11]);
        lines.push(quads[i+9], quads[i+10], quads[i+11], quads[i+0], quads[i+1], quads[i+2]);
    }

    return lines;
}

function getTriEdges(tris)
{
    var i;
    var lines = [];

    for (i=0; i < tris.length; i+=9)
    {
        lines.push(tris[i+0], tris[i+1], tris[i+2], tris[i+3], tris[i+4], tris[i+5]);
        lines.push(tris[i+3], tris[i+4], tris[i+5], tris[i+6], tris[i+7], tris[i+8]);
        lines.push(tris[i+6], tris[i+7], tris[i+8], tris[i+0], tris[i+1], tris[i+2]);
    }

    return lines;
}

function resizeQuadFaces(quads, size)
{
    var i, xCenter, yCenter, zCenter;

    for (i=0; i < quads.length; i+=12)
    {
        xCenter = (quads[i+1*3] - quads[i+0]) / 4.0;
        xCenter += (quads[i+2*3] - quads[i+0]) / 4.0;
        xCenter += (quads[i+3*3] - quads[i+0]) / 4.0;
        xCenter += quads[i+0];
        
        yCenter = (quads[i+1*3+1] - quads[i+1]) / 4.0;
        yCenter += (quads[i+2*3+1] - quads[i+1]) / 4.0;
        yCenter += (quads[i+3*3+1] - quads[i+1]) / 4.0;
        yCenter += quads[i+1];

        zCenter = (quads[i+1*3+2] - quads[i+2]) / 4.0;
        zCenter += (quads[i+2*3+2] - quads[i+2]) / 4.0;
        zCenter += (quads[i+3*3+2] - quads[i+2]) / 4.0;
        zCenter += quads[i+2];

        quads[i+0] = (quads[i+0] - xCenter) * size + xCenter;
        quads[i+1] = (quads[i+1] - yCenter) * size + yCenter;
        quads[i+2] = (quads[i+2] - zCenter) * size + zCenter;
        
        quads[i+1*3] = (quads[i+1*3] - xCenter) * size + xCenter;
        quads[i+1*3+1] = (quads[i+1*3+1] - yCenter) * size + yCenter;
        quads[i+1*3+2] = (quads[i+1*3+2] - zCenter) * size + zCenter;
        
        quads[i+2*3] = (quads[i+2*3] - xCenter) * size + xCenter;
        quads[i+2*3+1] = (quads[i+2*3+1] - yCenter) * size + yCenter;
        quads[i+2*3+2] = (quads[i+2*3+2] - zCenter) * size + zCenter;
        
        quads[i+3*3] = (quads[i+3*3] - xCenter) * size + xCenter;
        quads[i+3*3+1] = (quads[i+3*3+1] - yCenter) * size + yCenter;
        quads[i+3*3+2] = (quads[i+3*3+2] - zCenter) * size + zCenter;
    }
}

function resizeTriFaces(tris, size)
{
    var i, xCenter, yCenter, zCenter;

    for (i=0; i < tris.length; i+=9)
    {
        xCenter = (tris[i+1*3] - tris[i+0]) / 3.0;
        xCenter += (tris[i+2*3] - tris[i+0]) / 3.0;
        xCenter += tris[i+0];
        
        yCenter = (tris[i+1*3+1] - tris[i+1]) / 3.0;
        yCenter += (tris[i+2*3+1] - tris[i+1]) / 3.0;
        yCenter += tris[i+1];

        zCenter = (tris[i+1*3+2] - tris[i+2]) / 3.0;
        zCenter += (tris[i+2*3+2] - tris[i+2]) / 3.0;
        zCenter += tris[i+2];

        tris[i+0] = (tris[i+0] - xCenter) * size + xCenter;
        tris[i+1] = (tris[i+1] - yCenter) * size + yCenter;
        tris[i+2] = (tris[i+2] - zCenter) * size + zCenter;
        
        tris[i+1*3] = (tris[i+1*3] - xCenter) * size + xCenter;
        tris[i+1*3+1] = (tris[i+1*3+1] - yCenter) * size + yCenter;
        tris[i+1*3+2] = (tris[i+1*3+2] - zCenter) * size + zCenter;
        
        tris[i+2*3] = (tris[i+2*3] - xCenter) * size + xCenter;
        tris[i+2*3+1] = (tris[i+2*3+1] - yCenter) * size + yCenter;
        tris[i+2*3+2] = (tris[i+2*3+2] - zCenter) * size + zCenter;
    }
}
