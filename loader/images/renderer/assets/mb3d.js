var Mb3D = {};
((Mb3D.CameraRig = (function (e) {
  var t,
    n,
    i,
    r,
    a,
    o,
    s = !1,
    l = {
      cameraPosition: new e.Vector3(),
      targetPosition: new e.Vector3(),
      enableKeys: !1,
      autoRotateSpee: 0,
      minDistance: 0,
      maxDistance: 0,
      zoomSpeed: 0,
      enableDamping: !0,
      dampingFacto: 0,
    },
    c = function () {
      return n.target.distanceTo(t.position);
    },
    u = function (e, t) {
      arguments.length
        ? ((n.minDistance = e), (n.maxDistance = t))
        : ((n.minDistance = a), (n.maxDistance = o));
    },
    h = function (n) {
      if (!arguments.length) return t.position;
      n instanceof e.Vector3
        ? t.position.copy(n)
        : "array" != typeof n && t.position.fromArray(n);
    },
    d = function (t) {
      if (!arguments.length) return n.target;
      t instanceof e.Vector3
        ? n.target.copy(t)
        : "array" != typeof t && n.target.fromArray(t);
    },
    p = function (i, r) {
      var s;
      "function" != typeof r && (r = function () {});
      var l = c();
      i =
        i < 0
          ? (s = o - l) <= 0
            ? 0
            : s > 0 && s < Math.abs(i)
              ? s
              : -i
          : (s = l - a) <= 0
            ? 0
            : s > 0 && s < i
              ? -s
              : -i;
      var u = t.position.clone(),
        h = n.target.clone(),
        d = new e.Vector3();
      (d.subVectors(u, h), d.normalize());
      var p = new e.Vector3();
      p = d.multiplyScalar(i);
      var f = t.position.clone();
      (f.add(p),
        new TimelineMax({ autoRemoveChildren: !0 }).to(
          t.position,
          1,
          {
            x: f.x,
            y: f.y,
            z: f.z,
            ease: Power3.easeInOut,
            onComplete: r,
            onCompleteParams: [r.arguments],
          },
          0,
        ));
    };
  return {
    init: function (s) {
      var l = void 0 !== (s = s || {}).fov ? s.fov : 70,
        c = void 0 !== s.aspect ? s.aspect : 1,
        u = void 0 !== s.near ? s.near : 0.1,
        h = void 0 !== s.far ? s.far : 1e4,
		frustumSize=3.5,
        d = void 0 !== s.domElement ? s.domElement : document;
      ((r =
        void 0 !== s.initPosition ? s.initPosition : new e.Vector3(0, 0, 10)),
        (a = void 0 !== s.minDistance ? s.minDistance : 0.1),
        (o = void 0 !== s.maxDistance ? s.maxDistance : 30),
       //(t = new e.PerspectiveCamera(l, c, u, h)).position.copy(r),
        (t = new e.OrthographicCamera(frustumSize / - 2, frustumSize / 2, frustumSize / 2, frustumSize / - 2, u, h)).position.copy(r),
        ((n = new e.OrbitControls(t, d)).enableKeys = !1),
        (n.autoRotateSpeed = 0.25),
        (n.minDistance = a),
        (n.maxDistance = o),
        (n.zoomSpeed = 0.25),
        (n.enableDamping = !0),
        (n.dampingFactor = 0.15),
        (n.rotateSpeed = 1),
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        ) && ((n.zoomSpeed = 0.5), (n.rotateSpeed = 0.25)),
        (i = n.target));
    },
    camera: function () {
      return t;
    },
    controls: function () {
      return n;
    },
    target: function () {
      return i;
    },
    copyCamera: function () {
      return new e.PerspectiveCamera().copy(t);
    },
    targetDistance: c,
    refreshAspect: function (e) {
      ((t.aspect = e), t.updateProjectionMatrix());
    },
    setMinMax: u,
    cameraPosition: h,
    targetPosition: d,
    casheState: function () {
      ((s = !0),
        l.cameraPosition.copy(t.position),
        l.targetPosition.copy(i),
        (l.enableKeys = n.enableKeys),
        (l.autoRotateSpeed = n.autoRotateSpeed),
        (l.minDistance = n.minDistance),
        (l.maxDistance = n.maxDistance),
        (l.zoomSpeed = n.zoomSpeed),
        (l.enableDamping = n.enableDamping),
        (l.dampingFactor = n.dampingFactor));
    },
    restoreState: function () {
      s
        ? (t.position.copy(l.cameraPosition),
          i.copy(l.targetPosition),
          (n.enableKeys = l.enableKeys),
          (n.autoRotateSpeed = l.autoRotateSpeed),
          (n.minDistance = l.minDistance),
          (n.maxDistance = l.maxDistance),
          (n.zoomSpeed = l.zoomSpeed),
          (n.enableDamping = l.enableDamping),
          (n.dampingFactor = l.dampingFactor),
          t.updateProjectionMatrix(),
          t.lookAt(n.target))
        : console.error(
            "Mb3D.CameraRig.retrieveState: There is no data in the cashe to retrieve, call 'casheState' first.",
          );
    },
    track: {
      inout: p,
      line: function () {},
      curve: function (i, r, a) {
        function o() {
          (e.Quaternion.slerp(g, _, y, p.interpolator),
            (b.x = 0),
            (b.y = 0),
            (b.z = p.length),
            b.applyQuaternion(y),
            t.position.copy(b).add(n.target),
            b.set(0, 1, 0),
            b.applyQuaternion(y),
            t.up.copy(b),
            t.updateProjectionMatrix(),
            t.lookAt(n.target));
        }
        function s() {
          (t.up.set(0, 1, 0), "function" == typeof a && a());
        }
        var l = t.position.clone(),
          c = n.target.clone();
        (t.position.copy(i), n.target.copy(r), t.lookAt(n.target));
        var u = t.quaternion.clone();
        (t.position.copy(l),
          n.target.copy(c),
          t.lookAt(n.target),
          t.updateProjectionMatrix());
        var h = new e.Vector3(),
          d = new e.Vector3(),
          p = { interpolator: 0, length: null },
          f = t.position;
        (h.copy(f).sub(n.target), (p.length = h.length()));
        var m = i;
        d.copy(m).sub(r);
        var v = d.length(),
          g = new e.Quaternion().copy(t.quaternion),
          _ = new e.Quaternion().copy(u),
          y = new e.Quaternion().copy(t.quaternion),
          b = new e.Vector3(),
          w = new TimelineMax({
            onUpdate: o,
            onComplete: s,
            autoRemoveChildren: !0,
          });
        (w.to(
          n.target,
          2,
          {
            x: r.x,
            y: r.y,
            z: r.z,
            ease: Power3.easeInOut,
          },
          0,
        ),
          w.to(
            p,
            2,
            { interpolator: 1, length: v, ease: Power3.easeInOut },
            0,
          ));
      },
      reset: function (i) {
        "function" != typeof i && (i = function () {});
        var a = new e.Vector3().distanceTo(r),
          o = t.position.clone(),
          s = n.target.clone(),
          l = new e.Vector3();
        (l.subVectors(o, s), l.normalize());
        var c = new e.Vector3();
        c = l.multiplyScalar(a);
        var u = new e.Vector3();
        u.add(c);
        var h = new TimelineMax({ autoRemoveChildren: !0 });
        (h.to(
          t.position,
          1,
          { x: u.x, y: u.y, z: u.z, ease: Power3.easeInOut },
          0,
        ),
          h.to(
            n.target,
            1,
            {
              x: 0,
              y: 0,
              z: 0,
              ease: Power3.easeInOut,
              onComplete: i,
              onCompleteParams: [i.arguments],
            },
            0,
          ));
      },
    },
  };
})(THREE)),
  (THREE.BinaryGZTextureLoader = function (e) {
    ("boolean" == typeof e &&
      (console.warn(
        "THREE.BinaryGZTextureLoader: showStatus parameter has been removed from constructor.",
      ),
      (e = void 0)),
      (this.manager = void 0 !== e ? e : THREE.DefaultLoadingManager));
  }),
  (THREE.BinaryGZTextureLoader.prototype.constructor =
    THREE.BinaryGZTextureLoader),
  (THREE.BinaryGZTextureLoader.prototype.load = function (e, t, n, i) {
    var r = new THREE.FileLoader(this.manager);
    (r.setResponseType("arraybuffer"),
      r.load(
        e,
        function (e) {
          var n = this.unzipTypedArray(e),
            i = new THREE.DataTexture();
          ((i.data = new Uint8Array(n)),
            (i.needsUpdate = !0),
            void 0 !== t && t(i));
        }.bind(this),
        n,
        i,
      ));
  }),
  (THREE.BinaryGZTextureLoader.prototype.unzipTypedArray = function (e) {
    var t = new Uint8Array(e);
    return 31 === t[0] && 139 === t[1]
      ? (Zlib ||
          Notify.error(
            "THREE.BinaryGZTextureLoader: Failed to use a gunzip.min.js to uncompress a gz file.\n You can add this vendors to enable this feature or adds the good header in your gzip file served by your server",
          ),
        new Zlib.Gunzip(t).decompress().buffer)
      : e;
  }),
  (THREE.Hotspot = function (e) {
    (THREE.Object3D.call(this),
      (this.type = "Hotspot"),
      (e = e || {}),
      (this.position =
        void 0 !== e.position ? e.position : new THREE.Vector3()),
      (this.userData.element =
        void 0 !== e.element ? e.element : document.createElement("div")),
      (this.userData.type = void 0 !== e.type ? e.type : -1),
      (this.userData.isHidden = !1),
      (this.userData.selected = !1),
      (this.userData.typeIsSelected = !0),
      (this.userData.worldPosition = new THREE.Vector3()));
  }),
  (THREE.Hotspot.prototype = Object.create(THREE.Object3D.prototype)),
  (THREE.Hotspot.prototype.constructor = THREE.Hotspot),
  (THREE.Hotspot.prototype.getWorldPosition = function () {
    return this.userData.worldPosition.setFromMatrixPosition(this.matrixWorld);
  }),
  (THREE.Hotspot.prototype.hide = function () {
    (this.userData.element.classList.add("hidden"),
      (this.userData.isHidden = !0));
  }),
  (THREE.Hotspot.prototype.show = function () {
    (this.userData.element.classList.remove("hidden"),
      (this.userData.isHidden = !1));
  }),
  (THREE.Hotspot.prototype.hideLabel = function () {
    this.userData.element
      .getElementsByClassName("hotspot_label")[0]
      .classList.add("hidden");
  }),
  (THREE.Hotspot.prototype.showLabel = function () {
    this.userData.element
      .getElementsByClassTagName("hotspot_label")[0]
      .classList.remove("hidden");
  }),
  (THREE.Hotspot.prototype.removeElement = function () {
    this.userData.element.parentNode &&
      this.userData.element.parentNode.removeChild(this.userData.element);
  }),
  (THREE.HotspotCluster = function (e, t, n) {
    (THREE.Object3D.call(this),
      (this.type = "HotspotCluster"),
      (this.userData.camera = void 0 !== e ? e : null),
      (this.userData.intersectable = void 0 !== t ? t : []),
      (this.userData.domElement = void 0 !== n ? n : document),
      (this.userData.hotspotContainerWidth = 500),
      (this.userData.hotspotContainerHeight = 500),
      (this.userData.testForOcclusion = !0),
      (this.userData.distance = 5),
      (this.userData.autoHide = !0),
      (this.isCutaway = !1));
    var i = this,
      r = (new THREE.Vector3(), new THREE.Frustum()),
      a = new THREE.Matrix4(),
      o = new THREE.Raycaster();
    this.update = function () {
      function e() {
        var e = i.children[c].getWorldPosition();
        e.project(i.userData.camera);
        var t = (e.x + 1) / 2,
          n = (1 - e.y) / 2,
          r = t * i.userData.hotspotContainerWidth,
          a = n * i.userData.hotspotContainerHeight;
        i.children[c].userData.element.style.transform =
          "translate(" + r + "px," + a + "px)";
      }
      function t() {
        return !0 !== i.children[c].userData.typeIsSelected;
      }
      function n() {
        if (!0 === i.children[c].userData.selected) return !1;
        if (!1 === i.userData.testForOcclusion) return !0;
        if (!0 === i.isCutaway) {
          var e = i.children[c].getWorldPosition(),
            t = i.userData.camera.position.clone(),
            n = e.sub(t);
          o.set(t, n.clone().normalize());
          var r = o.intersectObjects(i.userData.intersectable, !0);
          return !!(r[0] && r[0].distance < n.length());
        }
        var a = i.children[c].getWorldPosition(),
          s = i.userData.camera.position.clone();
        return (
          s.sub(a.clone()),
          s.normalize().dot(a.normalize()) < 0 || i.scale.x < 1
        );
      }
      function s() {
        return (
          !0 !== i.children[c].userData.selected &&
          (!1 === i.userData.testForOcclusion ||
            (i.userData.camera.updateMatrix(),
            i.userData.camera.updateMatrixWorld(),
            i.userData.camera.matrixWorldInverse.getInverse(
              i.userData.camera.matrixWorld,
            ),
            a.multiplyMatrices(
              i.userData.camera.projectionMatrix,
              i.userData.camera.matrixWorldInverse,
            ),
            r.setFromMatrix(a),
            !r.containsPoint(i.children[c].getWorldPosition())))
        );
      }
      function l() {
        var e = i.children[c].position.clone(),
          t = i.userData.camera.position.clone();
        return e.distanceTo(t);
      }
      for (var c = 0; c < i.children.length; c++)
        (e(),
          t() || n() || s() ? i.children[c].hide() : i.children[c].show(),
          !0 === this.userData.autoHide &&
            (l() > this.userData.distance
              ? i.children[c].hideLabel()
              : i.children[c].showLabel()));
    };
  }),
  (THREE.HotspotCluster.prototype = Object.create(THREE.Object3D.prototype)),
  (THREE.HotspotCluster.prototype.constructor = THREE.HotspotCluster),
  (THREE.HotspotCluster.prototype.setHotspotContainerSize = function (e, t) {
    arguments.length
      ? ((this.userData.hotspotContainerWidth = e),
        (this.userData.hotspotContainerHeight = t))
      : ((this.userData.hotspotContainerWidth =
          this.userData.domElement.clientWidth),
        (this.userData.hotspotContainerHeight =
          this.userData.domElement.clientHeight));
  }),
  (THREE.HotspotCluster.prototype.setHotspotContainerMargin = function (e, t) {
    ((this.userData.domElement.style.marginLeft = e + "px"),
      (this.userData.domElement.style.marginTop = t + "px"));
  }),
  (THREE.HotspotCluster.prototype.hide = function () {
    this.userData.domElement.classList.add("hidden");
  }),
  (THREE.HotspotCluster.prototype.show = function () {
    this.userData.domElement.classList.remove("hidden");
  }),
  (THREE.HotspotCluster.prototype.dispose = function () {
    for (var e = 0; e < this.children.length; e++)
      this.children[e].removeElement();
    this.children = [];
  }),
  (THREE.pbrGlobeCutawayShader = {
    pbr: {
      uniforms: {
        fogDensity: { type: "1f", value: 25e-5 },
        fogNear: { type: "1f", value: 1 },
        fogFar: { type: "1f", value: 2e3 },
        fogColor: { type: "c", value: new THREE.Color(16777215) },
        uCutawayRadius: { type: "f", value: -1.6 },
        uCutawayThreshold: { type: "f", value: -1.6 },
        uOffsetRepeat: { type: "v4", value: new THREE.Vector4(0, 0, 1, 1) },
        uAlbedoColor: { type: "c", value: new THREE.Color(1, 1, 1) },
        uMetalnessFactor: { type: "1f", value: 1 },
        uAOFactor: { type: "1f", value: 1 },
        uFlipY: { type: "i", value: 0 },
        uNormalMapFactor: { type: "1f", value: 1 },
        uTextureBumpMapSize: { type: "1f", value: 1024 },
        uBumpMapFactor: { type: "1f", value: 1 },
        uRoughnessFactor: { type: "1f", value: 1 },
        uEmissiveColor: { type: "c", value: new THREE.Color(0, 0, 0) },
        uOpacityFactor: { type: "1f", value: 1 },
        uSpecularF0Factor: { type: "1f", value: 1 },
        uAlbedoBlendFactor: { type: "1f", value: 0 },
        sTextureAlbedo: { type: "t", value: null },
        sTextureMetalness: { type: "t", value: null },
        sTextureAO: { type: "t", value: null },
        sTextureNormalMap: { type: "t", value: null },
        sTextureBumpMap: { type: "t", value: null },
        sTextureRoughness: { type: "t", value: null },
        sTextureEmissive: { type: "t", value: null },
        sTextureOpacity: { type: "t", value: null },
        sTextureSpecularF0: { type: "t", value: null },
        sTextureAlbedoBlend: { type: "t", value: null },
        uOccludeSpecular: { type: "i", value: 0 },
        sTexturDisplacement: { type: "t", value: null },
        uDisplacementScale: { type: "1f", value: 1 },
        uDisplacementBias: { type: "1f", value: 0 },
        uDiffuseSPH: { type: "fv", value: null },
        uEnvironment: { type: "t", value: null },
        uEnvironmentTransform: { type: "m4", value: new THREE.Matrix4() },
        uTextureEnvironmentSpecularPBRLodRange: {
          type: "v2",
          value: new THREE.Vector2(10, 5),
        },
        uTextureEnvironmentSpecularPBRTextureSize: {
          type: "v2",
          value: new THREE.Vector2(1024, 512),
        },
        sIntegrateBRDF: { type: "t", value: null },
        uSpecularPeak: { type: "i", value: 1 },
        uOcclusionHorizon: { type: "i", value: 1 },
        uEnvironmentExposure: { type: "1f", value: 1 },
		toneMappingExposure: { type: "1f", value: 1 }
      },
      vertexShader: [
        "precision highp float;",
        "precision highp int;",
        "#define SHADER_NAME pbr2",
        "#define NUM_CLIPPING_PLANES 0",
        "uniform mat4 modelMatrix;",
        "uniform mat4 modelViewMatrix;",
        "uniform mat4 projectionMatrix;",
        "uniform mat4 viewMatrix;",
        "uniform mat3 normalMatrix;",
        "uniform vec3 cameraPosition;",
        "attribute vec3 position;",
        "attribute vec3 normal;",
        "attribute vec2 uv;",
        "attribute vec4 tangent;",
        "uniform float uCutawayThreshold;",
        "#ifdef USE_COLOR",
        "attribute vec3 color;",
        "#endif",
        "varying vec3 vViewPosition;",
        "#ifndef FLAT_SHADED",
        "varying vec3 vNormal;",
        "#endif",
        "#ifndef NO_TANGENT",
        "varying vec4 vTangent;",
        "#endif",
        "#define EPSILON 1e-6",
        "struct IncidentLight {",
        "vec3 color;",
        "vec3 direction;",
        "bool visible;",
        "};",
        "struct ReflectedLight {",
        "vec3 directDiffuse;",
        "vec3 directSpecular;",
        "vec3 indirectDiffuse;",
        "vec3 indirectSpecular;",
        "};",
        "struct GeometricContext {",
        "vec3 position;",
        "vec3 normal;",
        "vec3 viewDir;",
        "};",
        "#ifndef NO_CUTAWAY",
        "varying vec3 vVertexWorldPosition;",
        "#endif",
        "#if defined( USE_ALBEDOMAP ) || defined( USE_METALNESSMAP ) || defined( USE_AOMAP ) || defined( USE_NORMALMAP ) || defined( USE_BUMPMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_SPECULARF0MAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ALBEDOBLENDMAP )",
        "varying vec2 vUv;",
        "uniform vec4 uOffsetRepeat;",
        "#endif",
        "#ifdef USE_DISPLACEMENTMAP",
        "uniform sampler2D sTexturDisplacement;",
        "uniform float uDisplacementScale;",
        "uniform float uDisplacementBias;",
        "#endif",
        "#ifdef USE_COLOR",
        "varying vec3 vColor;",
        "#endif",
        "#ifdef USE_LOGDEPTHBUF",
        "#ifdef USE_LOGDEPTHBUF_EXT",
        "varying float vFragDepth;",
        "#endif",
        "uniform float logDepthBufFC;",
        "#endif",
        "#if NUM_CLIPPING_PLANES > 0",
        "vViewPosition = - mvPosition.xyz;",
        "#endif",
        "void main() {",
        "mat3 temp = normalMatrix;",
        "mat4 normalMatrix4 = mat4( temp[0][0], temp[0][1], temp[0][2], 0.0, temp[1][0], temp[1][1], temp[1][2], 0.0, temp[2][0], temp[2][1], temp[2][2], 0.0, 0.0, 0.0, 0.0, 1.0 );",
        "#if defined( USE_ALBEDOMAP ) || defined( USE_METALNESSMAP ) || defined( USE_AOMAP ) || defined( USE_NORMALMAP ) || defined( USE_BUMPMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_SPECULARF0MAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ALBEDOBLENDMAP )",
        "vUv = uv * uOffsetRepeat.zw + uOffsetRepeat.xy;",
        "#endif",
        "#ifdef USE_COLOR",
        "vColor.xyz = color.xyz;",
        "#endif",
        "vec3 objectNormal = vec3( normal );",
        "vec4 objectTangent = vec4( tangent );",
        "#ifdef FLIP_SIDED",
        "objectNormal = -objectNormal;",
        "objectTangent = -objectTangent;",
        "#endif",
        "vec3 transformedNormal = normalMatrix * objectNormal;",
        "vec4 transformedTangent = normalMatrix4 * objectTangent;",
        "#ifndef FLAT_SHADED",
        "vNormal = transformedNormal;",
        "#endif",
        "#ifndef NO_TANGENT",
        "vTangent = transformedTangent;",
        "#endif",
        "vec3 transformed = vec3( position );",
        "#ifdef PLANER_CUTAWAY",
        "#ifdef X_AXIS_CUTAWAY",
        "transformed.x = uCutawayThreshold;",
        "#elif defined( Y_AXIS_CUTAWAY )",
        "transformed.y = uCutawayThreshold;",
        "#elif defined( Z_AXIS_CUTAWAY )",
        "transformed.z = uCutawayThreshold;",
        "#endif",
        "#endif",
        "#ifdef USE_DISPLACEMENTMAP",
        "transformed += normal * ( texture2D( sTexturDisplacement, uv ).x * uDisplacementScale + uDisplacementBias );",
        "#endif",
        "#ifndef NO_CUTAWAY",
        "vVertexWorldPosition = transformed;",
        "#endif",
        "vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );",
        "gl_Position = projectionMatrix * mvPosition;",
        "#ifdef USE_LOGDEPTHBUF",
        "gl_Position.z = log2(max( EPSILON, gl_Position.w + 1.0 )) * logDepthBufFC;",
        "#ifdef USE_LOGDEPTHBUF_EXT",
        "vFragDepth = 1.0 + gl_Position.w;",
        "#else",
        "gl_Position.z = (gl_Position.z - 1.0) * gl_Position.w;",
        "#endif",
        "#endif",
        "#if NUM_CLIPPING_PLANES > 0",
        "vViewPosition = - mvPosition.xyz;",
        "#endif",
        "vViewPosition = - mvPosition.xyz;",
        "}",
      ].join("\n"),
      fragmentShader: [
        "precision highp float;",
        "precision highp int;",
        "#define SHADER_NAME pbr2",
        "#define NUM_CLIPPING_PLANES 0",
        "uniform mat4 viewMatrix;",
        "uniform vec3 cameraPosition;",
        "#define TONE_MAPPING",
        "uniform float toneMappingExposure;",
        "uniform float toneMappingWhitePoint;",
        "#define PANORAMA",
        "#define UE4",
        "#define LUV",
        "#define PI 3.1415926535897932384626433832795",
        "#define PI_2 ( 2.0*3.1415926535897932384626433832795 )",
        "#define INV_PI 1.0/PI",
        "#define INV_LOG2 1.4426950408889634073599246810019",
        "#define saturate(a) clamp( a, 0.0, 1.0 )",
        "#define whiteCompliment(a) ( 1.0 - saturate( a ) )",
        "vec3 sphericalHarmonics( const vec3 sph[9], const in vec3 normal )",
        "{",
        "float x = normal.x;",
        "float y = normal.y;",
        "float z = normal.z;",
        "vec3 result = (",
        "sph[0] +",
        "sph[1] * y +",
        "sph[2] * z +",
        "sph[3] * x +",
        "sph[4] * y * x +",
        "sph[5] * y * z +",
        "sph[6] * (3.0 * z * z - 1.0) +",
        "sph[7] * (z * x) +",
        "sph[8] * (x*x - y*y)",
        ");",
        "return max(result, vec3(0.0));",
        "}",
        "vec3 LinearToneMapping( vec3 color ) {",
        "return toneMappingExposure * color;",
        "}",
        "vec3 ReinhardToneMapping( vec3 color ) {",
        "color *= toneMappingExposure;",
        "return saturate( color / ( vec3( 1.0 ) + color ) );",
        "}",
        "#define Uncharted2Helper( x ) max( ( ( x * ( 0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02 ) / ( x * ( 0.15 * x + 0.50 ) + 0.20 * 0.30 ) ) - 0.02 / 0.30, vec3( 0.0 ) )",
        "vec3 Uncharted2ToneMapping( vec3 color ) {",
        "color *= toneMappingExposure;",
        "return saturate( Uncharted2Helper( color ) / Uncharted2Helper( vec3( toneMappingWhitePoint ) ) );",
        "}",
        "vec3 OptimizedCineonToneMapping( vec3 color ) {",
        "color *= toneMappingExposure;",
        "color = max( vec3( 0.0 ), color - 0.004 );",
        "return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );",
        "}",
        "vec3 toneMapping( vec3 color ) {",
        "return LinearToneMapping( color );",
        //"return ReinhardToneMapping( color );",
        "}",
        "vec3 textureRGB(const in sampler2D texture, const in vec2 uv) {",
        "return texture2D(texture, uv.xy ).rgb;",
        "}",
        "vec4 textureRGBA(const in sampler2D texture, const in vec2 uv) {",
        "return texture2D(texture, uv.xy ).rgba;",
        "}",
        "float textureIntensity(const in sampler2D texture, const in vec2 uv) {",
        "return texture2D(texture, uv).r;",
        "}",
        "float textureAlpha(const in sampler2D texture, const in vec2 uv) {",
        "return texture2D(texture, uv.xy ).a;",
        "}",
        "#define LIN_SRGB(x) x < 0.0031308 ? x * 12.92 : 1.055 * pow(x, 1.0/2.4) - 0.055",
        "float linearTosRGB(const in float c) {",
        "return LIN_SRGB(c);",
        "}",
        "vec3 linearTosRGB(const in vec3 c) {",
        "return vec3(LIN_SRGB(c.r), LIN_SRGB(c.g), LIN_SRGB(c.b));",
        "}",
        "vec4 linearTosRGB(const in vec4 c) {",
        "return vec4(LIN_SRGB(c.r), LIN_SRGB(c.g), LIN_SRGB(c.b), c.a);",
        "}",
        "#define SRGB_LIN(x) x < 0.04045 ? x * (1.0 / 12.92) : pow((x + 0.055) * (1.0 / 1.055), 2.4)",
        "float sRGBToLinear(const in float c) {",
        "return SRGB_LIN(c);",
        "}",
        "vec3 sRGBToLinear(const in vec3 c) {",
        "return vec3(SRGB_LIN(c.r), SRGB_LIN(c.g), SRGB_LIN(c.b));",
        "}",
        "vec4 sRGBToLinear(const in vec4 c) {",
        "return vec4(SRGB_LIN(c.r), SRGB_LIN(c.g), SRGB_LIN(c.b), c.a);",
        "}",
        "vec3 RGBMToRGB( const in vec4 rgba ) {",
        "const float maxRange = 8.0;",
        "return rgba.rgb * maxRange * rgba.a;",
        "}",
        "const mat3 LUVInverse = mat3( 6.0013,    -2.700,   -1.7995,",
        "-1.332,    3.1029,   -5.7720,",
        "0.3007,    -1.088,    5.6268 );",
        "vec3 LUVToRGB( const in vec4 vLogLuv ) {",
        "float Le = vLogLuv.z * 255.0 + vLogLuv.w;",
        "vec3 Xp_Y_XYZp;",
        "Xp_Y_XYZp.y = exp2((Le - 127.0) / 2.0);",
        "Xp_Y_XYZp.z = Xp_Y_XYZp.y / vLogLuv.y;",
        "Xp_Y_XYZp.x = vLogLuv.x * Xp_Y_XYZp.z;",
        "vec3 vRGB = LUVInverse * Xp_Y_XYZp;",
        "return max(vRGB, 0.0);",
        "}",
        "vec3 getSpecularDominantDir( const in int specPeek, const in vec3 N, const in vec3 R, const in float realRoughness ) {",
        "vec3 dominant;",
        "if ( specPeek == 1 ) {",
        "float smoothness = 1.0 - realRoughness;",
        "float lerpFactor = smoothness * (sqrt(smoothness) + realRoughness);",
        "dominant = mix(N, R, lerpFactor);",
        "} else {",
        "dominant = R;",
        "}",
        "return dominant;",
        "}",
        "float occlusionHorizon( const in int occHor, const in vec3 R, const in vec3 normal) {",
        "if ( occHor == 0)",
        "return 1.0;",
        "float factor = clamp( 1.0 + 1.3 * dot(R, normal), 0.1, 1.0 );",
        "return factor * factor;",
        "}",
        "vec4 encodeRGBM(const in vec3 col, const in float range) {",
        "if(range <= 0.0)",
        "return vec4(col, 1.0);",
        "vec4 rgbm;",
        "vec3 color = col / range;",
        "rgbm.a = clamp( max( max( color.r, color.g ), max( color.b, 1e-6 ) ), 0.0, 1.0 );",
        "rgbm.a = ceil( rgbm.a * 255.0 ) / 255.0;",
        "rgbm.rgb = color / rgbm.a;",
        "return rgbm;",
        "}",
        "vec3 decodeRGBM(const in vec4 col, const in float range) {",
        "if(range <= 0.0)",
        "return col.rgb;",
        "return range * col.rgb * col.a;",
        "}",
        "float adjustSpecular( const in float specular, const in vec3 normal ) {",
        "float normalLen = length(normal);",
        "if ( normalLen < 1.0) {",
        "float normalLen2 = normalLen * normalLen;",
        "float kappa = ( 3.0 * normalLen -  normalLen2 * normalLen )/( 1.0 - normalLen2 );",
        "return 1.0-min(1.0, sqrt( (1.0-specular) * (1.0-specular) + 1.0/kappa ));",
        "}",
        "return specular;",
        "}",
        "vec3 mtexNspaceTangent(const in vec4 tangent, const in vec3 normal, const in float factor, const in vec3 texnormal) {",
        "vec3 tang = vec3(0.0,1.0,0.0);",
        "float l = length(tangent.xyz);",
        "if (l != 0.0) {",
        "tang =  tangent.xyz / l;",
        "}",
        "vec3 B = tangent.w * normalize(cross(normal, tang));",
        "vec3 finalTex = texnormal.x*tang + texnormal.y*B + texnormal.z*normal;",
        "finalTex.xy *= factor;",
        "return normalize( finalTex );",
        "}",
        "vec2 normalMatcap(const in vec3 normal, const in vec3 nm_z) {",
        "vec3 nm_x = vec3(-nm_z.z, 0.0, nm_z.x);",
        "vec3 nm_y = cross(nm_x, nm_z);",
        "return vec2(dot(normal.xz, nm_x.xz), dot(normal, nm_y)) * vec2(0.5)  + vec2(0.5);",
        "}",
        "vec3 rgbToNormal(const in vec3 texel, const in int flipNormalY) {",
        "vec3 rgb = texel * vec3(2.0) + vec3(-1.0);",
        "rgb[1] = flipNormalY == 1 ? -rgb[1] : rgb[1];",
        "return rgb;",
        "}",
        "vec3 bumpMap(const in vec4 tangent, const in vec3 normal, const in vec2 gradient) {",
        "vec3 outnormal;",
        "float l = length(tangent.xyz);",
        "if (l != 0.0) {",
        "vec3 tang =  tangent.xyz / l;",
        "vec3 binormal = tangent.w * normalize(cross(normal, tang));",
        "outnormal = normal + gradient.x * tang + gradient.y * binormal;",
        "}",
        "else {",
        "outnormal = vec3(normal.x + gradient.x, normal.y + gradient.y, normal.z);",
        "}",
        "return normalize(outnormal);",
        "}",
        "vec2 textureGradient(in sampler2D texture, const in vec2 uv, const in float size) {",
        "float step = 1.0 / size;",
        "float dx = texture2D(texture, uv - vec2(step, 0.0)).r - texture2D(texture, uv + vec2(step, 0.0)).r;",
        "float dy = texture2D(texture, uv - vec2(0.0, step)).r - texture2D(texture, uv + vec2(0.0, step)).r;",
        "return vec2(dx, dy);",
        "}",
        "float specularOcclusion(const in int occlude, const in float ao, const in vec3 N, const in vec3 V) {",
        "if(occlude == 0)",
        "return 1.0;",
        "float d = dot( N, V ) + ao;",
        "return clamp((d * d) - 1.0 + ao, 0.0, 1.0);",
        "}",
        "float adjustRoughnessNormalMap( const in float roughness, const in vec3 normal ) {",
        "float normalLen = length(normal);",
        "if ( normalLen < 1.0) {",
        "float normalLen2 = normalLen * normalLen;",
        "float kappa = ( 3.0 * normalLen -  normalLen2 * normalLen )/( 1.0 - normalLen2 );",
        "return min(1.0, sqrt( roughness * roughness + 1.0/kappa ));",
        "}",
        "return roughness;",
        "}",
        "float adjustRoughnessGeometry( const in float roughness, const in vec3 normal ) {",
        "vec3 vDx = dFdx( normal.xyz );",
        "vec3 vDy = dFdy( normal.xyz );",
        "return max(roughness, pow( clamp( max( dot( vDx, vDx ), dot( vDy, vDy ) ), 0.0, 1.0 ), 0.333 ));",
        "}",
        "mat3 environmentTransformPBR( const in mat4 tr ) {",
        "vec3 x = vec3(tr[0][0], tr[1][0], tr[2][0]);",
        "vec3 y = vec3(tr[0][1], tr[1][1], tr[2][1]);",
        "vec3 z = vec3(tr[0][2], tr[1][2], tr[2][2]);",
        "mat3 m = mat3(x, y, z);",
        "return m;",
        "}",
        "vec3 evaluateDiffuseSphericalHarmonics( const in vec3 shEnv[9], const in mat3 envTrans, const in vec3 N ) {",
        "return sphericalHarmonics( shEnv, envTrans * N );",
        "}",
        "vec3 computeIBLDiffuseUE4( const in vec3 normal, const in vec3 albedo, const in mat3 envTrans, const in vec3 sphHarm[9], const in float exposure ) {",
        "vec3 color = vec3(0.0);",
        "if ( albedo != color ) {",
        "return albedo * exposure * ( evaluateDiffuseSphericalHarmonics( sphHarm, envTrans, normal ) );",
        "}",
        "return color;",
        "}",
        "uniform vec3 uAlbedoColor;",
        "uniform float uMetalnessFactor;",
        "uniform float uRoughnessFactor;",
        "uniform vec3 uEmissiveColor;",
        "uniform float uOpacityFactor;",
        "uniform float uSpecularF0Factor;",
        "uniform float uAlbedoBlendFactor;",
        "uniform vec3 uDiffuseSPH[9];",
        "uniform mat4 uEnvironmentTransform;",
        "uniform vec2 uTextureEnvironmentSpecularPBRLodRange;",
        "uniform vec2 uTextureEnvironmentSpecularPBRTextureSize;",
        "uniform int uSpecularPeak;",
        "uniform int uOcclusionHorizon;",
        "uniform float uEnvironmentExposure;",
        "uniform int uOccludeSpecular;",
        "varying vec3 vViewPosition;",
        "uniform float uCutawayRadius;",
        "uniform float uCutawayThreshold;",
        "#ifndef FLAT_SHADED",
        "varying vec3 vNormal;",
        "#endif",
        "#ifndef NO_TANGENT",
        "varying vec4 vTangent;",
        "#endif",
        "struct IncidentLight {",
        "vec3 color;",
        "vec3 direction;",
        "bool visible;",
        "};",
        "struct ReflectedLight {",
        "vec3 directDiffuse;",
        "vec3 directSpecular;",
        "vec3 indirectDiffuse;",
        "vec3 indirectSpecular;",
        "};",
        "struct GeometricContext {",
        "vec3 position;",
        "vec3 normal;",
        "vec3 viewDir;",
        "};",
        "#ifndef NO_CUTAWAY",
        "varying vec3 vVertexWorldPosition;",
        "#endif",
        "#ifdef USE_COLOR",
        "varying vec3 vColor;",
        "#endif",
        "#if defined( USE_ALBEDOMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_AOMAP ) || defined( USE_NORMALMAP ) || defined( USE_BUMPMAP ) || defined( USE_METALNESSMAP ) || defined( USE_SPECULARF0MAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ALBEDOBLENDMAP )",
        "varying vec2 vUv;",
        "#endif",
        "#ifdef USE_ALBEDOMAP",
        "uniform sampler2D sTextureAlbedo;",
        "#endif",
        "#ifdef USE_ALBEDOBLENDMAP",
        "uniform sampler2D sTextureAlbedoBlend;",
        "#endif",
        "#ifdef USE_ALPHAMAP",
        "uniform sampler2D sTextureOpacity;",
        "#endif",
        "#ifdef USE_AOMAP",
        "uniform sampler2D sTextureAO;",
        "uniform float uAOFactor;",
        "#endif",
        "#ifdef USE_EMISSIVEMAP",
        "uniform sampler2D sTextureEmissive;",
        "#endif",
        "#ifdef USE_INTEGRATEBRDFMAP",
        "uniform sampler2D sIntegrateBRDF;",
        "#endif",
        "#ifdef USE_ENVIRONMENTMAP",
        "#ifdef ENVMAP_TYPE_CUBE",
        "uniform samplerCube envMap;",
        "#else",
        "uniform sampler2D uEnvironment;",
        "#endif",
        "#endif",
        "#ifdef USE_FOG",
        "uniform vec3 fogColor;",
        "#ifdef FOG_EXP2",
        "uniform float fogDensity;",
        "#else",
        "uniform float fogNear;",
        "uniform float fogFar;",
        "#endif",
        "#endif",
        "#define G1V(dotNV, k) (1./(dotNV*(1.-k)+k))",
        "vec4 LightingFuncPrep(const in vec3 N,",
        "const in vec3 V,",
        "const in float roughness)",
        "{",
        "float dotNV = saturate(dot(N,V));",
        "float alpha = roughness * roughness;",
        "float k = alpha * .5;",
        "float visNV = G1V(dotNV,k);",
        "vec4 prepSpec;",
        "prepSpec.x = alpha;",
        "prepSpec.y = alpha * alpha;",
        "prepSpec.z = k;",
        "prepSpec.w = visNV;",
        "return prepSpec;",
        "}",
        "vec3 LightingFuncUsePrepGGX(const vec4 prepSpec,",
        "const vec3 N,",
        "const vec3 V,",
        "const vec3 L,",
        "const vec3 F0,",
        "const float dotNL)",
        "{",
        "vec3 H = normalize(V+L);",
        "float dotNH = saturate(dot(N,H));",
        "float alphaSqr = prepSpec.y;",
        "float denom = dotNH * dotNH *(alphaSqr-1.) + 1.;",
        "float D = alphaSqr / (PI * denom * denom);",
        "float dotLH = saturate(dot(L,H));",
        "float dotLH5 = pow(1.-dotLH,5.);",
        "vec3 F = vec3(F0) + (vec3(1.)-F0)*(dotLH5);",
        "float visNL = G1V(dotNL, prepSpec.z);",
        "vec3 specular = D * F * visNL * prepSpec.w;",
        "return specular;",
        "}",
        "vec3 computeSpecular(const in vec3 normal,",
        "const in vec3 viewDir,",
        "const in vec3 lightDir,",
        "const in vec3 specular,",
        "const in vec4 prepSpec,",
        "const in float NdotL)",
        "{",
        "vec3 cSpec = LightingFuncUsePrepGGX( prepSpec, normal, viewDir, lightDir, specular, NdotL );",
        "if ( NdotL > 0.0 ) {",
        "return cSpec;",
        "}",
        "return vec3( 0.0 );",
        "}",
        "uniform vec3 ambientLightColor;",
        "vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {",
        "vec3 irradiance = ambientLightColor;",
        "return irradiance;",
        "}",
        "#if NUM_DIR_LIGHTS > 0",
        "struct DirectionalLight {",
        "vec3 direction;",
        "vec3 color;",
        "int shadow;",
        "float shadowBias;",
        "float shadowRadius;",
        "vec2 shadowMapSize;",
        "};",
        "uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];",
        "void getDirectionalDirectLightIrradiance( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight directLight ) {",
        "directLight.color = directionalLight.color;",
        "directLight.direction = directionalLight.direction;",
        "directLight.visible = true;",
        "}",
        "#endif",
        "#if NUM_POINT_LIGHTS > 0",
        "struct PointLight {",
        "vec3 position;",
        "vec3 color;",
        "float distance;",
        "float decay;",
        "int shadow;",
        "float shadowBias;",
        "float shadowRadius;",
        "vec2 shadowMapSize;",
        "};",
        "uniform PointLight pointLights[ NUM_POINT_LIGHTS ];",
        "void getPointDirectLightIrradiance( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight directLight ) {",
        "vec3 lVector = pointLight.position - geometry.position;",
        "directLight.direction = normalize( lVector );",
        "float lightDistance = length( lVector );",
        "if ( testLightInRange( lightDistance, pointLight.distance ) ) {",
        "directLight.color = pointLight.color;",
        "directLight.color *= punctualLightIntensityToIrradianceFactor( lightDistance, pointLight.distance, pointLight.decay );",
        "directLight.visible = true;",
        "} else {",
        "directLight.color = vec3( 0.0 );",
        "directLight.visible = false;",
        "}",
        "}",
        "#endif",
        "#if NUM_SPOT_LIGHTS > 0",
        "struct SpotLight {",
        "vec3 position;",
        "vec3 direction;",
        "vec3 color;",
        "float distance;",
        "float decay;",
        "float coneCos;",
        "float penumbraCos;",
        "int shadow;",
        "float shadowBias;",
        "float shadowRadius;",
        "vec2 shadowMapSize;",
        "};",
        "uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];",
        "void getSpotDirectLightIrradiance( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight directLight  ) {",
        "vec3 lVector = spotLight.position - geometry.position;",
        "directLight.direction = normalize( lVector );",
        "float lightDistance = length( lVector );",
        "float angleCos = dot( directLight.direction, spotLight.direction );",
        "if ( all( bvec2( angleCos > spotLight.coneCos, testLightInRange( lightDistance, spotLight.distance ) ) ) ) {",
        "float spotEffect = smoothstep( spotLight.coneCos, spotLight.penumbraCos, angleCos );",
        "directLight.color = spotLight.color;",
        "directLight.color *= spotEffect * punctualLightIntensityToIrradianceFactor( lightDistance, spotLight.distance, spotLight.decay );",
        "directLight.visible = true;",
        "} else {",
        "directLight.color = vec3( 0.0 );",
        "directLight.visible = false;",
        "}",
        "}",
        "#endif",
        "#if NUM_HEMI_LIGHTS > 0",
        "struct HemisphereLight {",
        "vec3 direction;",
        "vec3 skyColor;",
        "vec3 groundColor;",
        "};",
        "uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];",
        "vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in GeometricContext geometry ) {",
        "float dotNL = dot( geometry.normal, hemiLight.direction );",
        "float hemiDiffuseWeight = 0.5 * dotNL + 0.5;",
        "vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );",
        "return irradiance;",
        "}",
        "#endif",
        "#ifdef PANORAMA",
        "vec2 computeUVForMipmap( const in float level, const in vec2 uv, const in float size, const in float maxLOD ) {",
        "float widthForLevel = exp2( maxLOD-level);",
        "float heightForLevel = widthForLevel * 0.5;",
        "float texelSize = 1.0/size;",
        "vec2 uvSpaceLocal =  vec2(1.0) + uv * vec2(widthForLevel - 2.0, heightForLevel - 2.0);",
        "uvSpaceLocal.y += size - widthForLevel;",
        "return uvSpaceLocal * texelSize;",
        "}",
        "vec2 normalToPanoramaUVY( const in vec3 dir ) {",
        "float n = length(dir.xz);",
        "vec2 pos = vec2( (n>0.0000001) ? max(-1.0,dir.x / n) : 0.0, dir.y);",
        "if ( pos.x > 0.0 ) pos.x = min( 0.999999, pos.x );",
        "pos = acos(pos)*INV_PI;",
        "pos.x = (dir.z > 0.0) ? pos.x*0.5 : 1.0-(pos.x*0.5);",
        "pos.x = mod(pos.x-0.25+1.0, 1.0 );",
        "pos.y = 1.0-pos.y;",
        "return pos;",
        "}",
        "vec3 texturePanorama(const in sampler2D texture, const in vec2 uv) {",
        "vec4 rgba = texture2D(texture, uv );",
        "#ifdef FLOAT",
        "return rgba.rgb;",
        "#endif",
        "#ifdef RGBE",
        "return RGBEToRGB( rgba );",
        "#endif",
        "#ifdef RGBM",
        "return RGBMToRGB( rgba );",
        "#endif",
        "#ifdef LUV",
        "return LUVToRGB( rgba );",
        "#else",
        "return rgba.rgb;",
        "#endif",
        "}",
        "vec3 texturePanoramaLod( const in sampler2D texture, const in vec2 size, const in vec3 direction, const in float lodInput, const in float maxLOD ) {",
        "float lod = min( maxLOD, lodInput );",
        "vec2 uvBase = normalToPanoramaUVY( direction );",
        "float lod0 = floor(lod);",
        "vec2 uv0 = computeUVForMipmap(lod0, uvBase, size.x, maxLOD );",
        "vec3 texel0 = texturePanorama( texture, uv0.xy);",
        "float lod1 = ceil(lod);",
        "vec2 uv1 = computeUVForMipmap(lod1, uvBase, size.x, maxLOD );",
        "vec3 texel1 = texturePanorama( texture, uv1.xy);",
        "return mix(texel0, texel1, fract( lod ) );",
        "}",
        "#endif",
        "#ifdef UE4",
        "float linRoughnessToMipmap( float roughnessLinear ) {",
        "return sqrt(roughnessLinear);",
        "}",
        "vec3 prefilterEnvMap( float roughnessLinear, const in vec3 R, const in sampler2D texEnv, const in vec2 lodRange, const in vec2 size ) {",
        "#ifdef CUBEMAP_LOD",
        "float lod = linRoughnessToMipmap( roughnessLinear ) * lodRange[1];",
        "return textureCubeLodEXTFixed( uEnvironmentCube, R, lod );",
        "#elif defined( PANORAMA )",
        "float lod = linRoughnessToMipmap( roughnessLinear ) * lodRange[1];",
        "vec3 texel = texturePanoramaLod( texEnv, size, R, lod, lodRange[0] );",
        "return texel;",
        "#endif",
        "}",
        "vec2 integrateBRDF( const in sampler2D texBRDF,  float r, float NoV ) {",
        "vec4 rgba = texture2D( texBRDF, vec2(NoV, r ) );",
        "const float div = 1.0/65535.0;",
        "float b = (rgba[3] * 65280.0 + rgba[2] * 255.0);",
        "float a = (rgba[1] * 65280.0 + rgba[0] * 255.0);",
        "return vec2( a, b ) * div;",
        "}",
        "vec3 integrateBRDFApprox( const in vec3 specular, float roughness, float NoV ) {",
        "const vec4 c0 = vec4( -1, -0.0275, -0.572, 0.022 );",
        "const vec4 c1 = vec4( 1, 0.0425, 1.04, -0.04 );",
        "vec4 r = roughness * c0 + c1;",
        "float a004 = min( r.x * r.x, exp2( -9.28 * NoV ) ) * r.x + r.y;",
        "vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;",
        "return specular * AB.x + AB.y;",
        "}",
        "vec3 approximateSpecularIBL( const in vec3 N, const in vec3 V, const in float rLinear, const in vec3 specular, const in mat3 envTrans, const in sampler2D texEnv, const in vec2 lodRange, const in vec2 size, const in vec3 frontNormal, const in sampler2D texBRDF, const in int specPeek, const in int occHor, const in float exposure ) {",
        "float roughnessLinear = max( rLinear, 0.0);",
        "float NoV = clamp( dot( N, V ), 0.0, 1.0 );",
        "vec3 R = normalize( (2.0 * NoV ) * N - V);",
        "vec3 dominantR = getSpecularDominantDir( specPeek, N, R, roughnessLinear * roughnessLinear );",
        "vec3 dir = envTrans * dominantR;",
        "vec3 prefilteredColor = prefilterEnvMap( roughnessLinear, dir, texEnv, lodRange, size );",
        "prefilteredColor *= occlusionHorizon( occHor, dominantR, frontNormal );",
        "#ifdef MOBILE",
        "return exposure * prefilteredColor * integrateBRDFApprox( specular, roughnessLinear, NoV );",
        "#else",
        "vec2 envBRDF = integrateBRDF( texBRDF, roughnessLinear, NoV );",
        "return exposure * prefilteredColor * ( specular * envBRDF.x + envBRDF.y );",
        "#endif",
        "}",
        "#endif",
        "struct PhysicalMaterial {",
        "vec3  diffuseColor;",
        "float specularRoughness;",
        "vec3  specularColor;",
        "};",
        "void RE_Direct_Physical( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, const in vec4 prepSpec, inout ReflectedLight reflectedLight ) {",
        "float NdotL = saturate( dot( geometry.normal, directLight.direction ) );",
        "vec3 irradiance = NdotL * directLight.color;",
        "reflectedLight.directSpecular += irradiance * computeSpecular( geometry.normal, geometry.viewDir, directLight.direction, material.specularColor, prepSpec, NdotL );",
        "reflectedLight.directDiffuse += irradiance * material.diffuseColor;",
        "}",
        "#define RE_Direct       RE_Direct_Physical",
        "float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {",
        "return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );",
        "}",
        "#ifdef USE_SPECULARF0MAP",
        "uniform sampler2D sTextureSpecularF0;",
        "#endif",
        "#ifdef USE_NORMALMAP",
        "uniform sampler2D sTextureNormalMap;",
        "uniform float uNormalMapFactor;",
        "uniform int uFlipY;",
        "vec3 perturbNormal2Arb( const in vec3 eye_pos, const in vec3 surf_norm, const in float factor, vec3 texnormal ) {",
        "vec3 q0 = dFdx( eye_pos.xyz );",
        "vec3 q1 = dFdy( eye_pos.xyz );",
        "vec2 st0 = dFdx( vUv.st );",
        "vec2 st1 = dFdy( vUv.st );",
        "vec3 S = normalize( q0 * st1.t - q1 * st0.t );",
        "vec3 T = normalize( -q0 * st1.s + q1 * st0.s );",
        "vec3 N = normalize( surf_norm );",
        "texnormal.xy *= factor;",
        "mat3 tsn = mat3( S, T, N );",
        "return normalize( tsn * texnormal );",
        "}",
        "#endif",
        "#ifdef USE_BUMPMAP",
        "uniform sampler2D sTextureBumpMap;",
        "uniform float uTextureBumpMapSize;",
        "uniform float uBumpMapFactor;",
        "vec2 dHdxy_fwd( const in sampler2D texbump, const in vec2 uv, const in float factor ) {",
        "vec2 dSTdx = dFdx( uv.xy );",
        "vec2 dSTdy = dFdy( uv.xy );",
        "float Hll = factor * texture2D( texbump, uv.xy ).x;",
        "float dBx = factor * texture2D( texbump, uv.xy + dSTdx ).x - Hll;",
        "float dBy = factor * texture2D( texbump, uv.xy + dSTdy ).x - Hll;",
        "return vec2( dBx, dBy );",
        "}",
        "vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy ) {",
        "vec3 vSigmaX = dFdx( surf_pos );",
        "vec3 vSigmaY = dFdy( surf_pos );",
        "vec3 vN = surf_norm;",
        "vec3 R1 = cross( vSigmaY, vN );",
        "vec3 R2 = cross( vN, vSigmaX );",
        "float fDet = dot( vSigmaX, R1 );",
        "vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );",
        "return normalize( abs( fDet ) * surf_norm - vGrad );",
        "}",
        "#endif",
        "#ifdef USE_ROUGHNESSMAP",
        "uniform sampler2D sTextureRoughness;",
        "#endif",
        "#ifdef USE_METALNESSMAP",
        "uniform sampler2D sTextureMetalness;",
        "#endif",
        "#ifdef USE_LOGDEPTHBUF",
        "uniform float logDepthBufFC;",
        "#ifdef USE_LOGDEPTHBUF_EXT",
        "varying float vFragDepth;",
        "#endif",
        "#endif",
        "#if NUM_CLIPPING_PLANES > 0",
        "uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];",
        "#endif",
        "void main() {",
        "#ifdef SPHERICAL_CUTAWAY",
        "if( vVertexWorldPosition.x > uCutawayThreshold && vVertexWorldPosition.z > uCutawayThreshold ) {",
        "discard;",
        "}",
        "#elif defined ( PLANER_CUTAWAY )",
        "float dist = distance( vec3(0, 0, 0), vVertexWorldPosition.xyz );",
        "#ifdef X_AXIS_CUTAWAY",
        "if( ( vVertexWorldPosition.z < uCutawayThreshold ) || ( dist > abs( uCutawayRadius ) ) ) {",
        "discard;",
        "}",
        "#elif defined ( Z_AXIS_CUTAWAY )",
        "if( ( vVertexWorldPosition.x < uCutawayThreshold ) || ( dist > abs( uCutawayRadius ) ) ) {",
        "discard;",
        "}",
        "#endif",
        "#endif",
        "#if NUM_CLIPPING_PLANES > 0",
        "for ( int i = 0; i < NUM_CLIPPING_PLANES; ++ i ) {",
        "vec4 plane = clippingPlanes[ i ];",
        "if ( dot( vViewPosition, plane.xyz ) > plane.w ) discard;",
        "}",
        "#endif",
        "vec4 materialAlbedo = sRGBToLinear( vec4( uAlbedoColor, uOpacityFactor ) );",
        "ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );",
        "#if defined(USE_LOGDEPTHBUF) && defined(USE_LOGDEPTHBUF_EXT)",
        "gl_FragDepthEXT = log2(vFragDepth) * logDepthBufFC * 0.5;",
        "#endif",
        "#ifdef USE_ALBEDOMAP",
        "vec3 texelColor = textureRGB( sTextureAlbedo, vUv );",
        "texelColor = sRGBToLinear( texelColor );",
        "materialAlbedo.rgb *= texelColor;",
        "#endif",
        "vec3 materialAlbedoBlend;",
        "#ifdef USE_ALBEDOBLENDMAP",
        "vec3 texelColorBlend = textureRGB( sTextureAlbedoBlend, vUv );",
        "texelColorBlend = sRGBToLinear( texelColorBlend );",
        "materialAlbedoBlend = texelColorBlend;",
        "materialAlbedo.rgb = mix( materialAlbedo.rgb, materialAlbedoBlend, uAlbedoBlendFactor );",
        "#endif",
        "#ifdef USE_ALPHAMAP",
        "materialAlbedo.a *= texture2D( sTextureOpacity, vUv ).g;",
        "#endif",
        "#ifdef ALPHATEST",
        "if ( materialAlbedo.a < ALPHATEST ) discard;",
        "#endif",
        "float channelSpecularF0 = uSpecularF0Factor;",
        "#ifdef USE_SPECULARF0MAP",
        "float texelSpecularF0 = textureIntensity( sTextureSpecularF0, vUv );",
        "channelSpecularF0 *= texelSpecularF0;",
        "#endif",
        "#ifdef USE_NORMALMAP",
        "vec3 texelNormal = textureRGB( sTextureNormalMap, vUv );",
        "vec3 channelNormal = rgbToNormal( texelNormal, uFlipY );",
        "#endif",
        "#ifdef USE_BUMPMAP",
        "#ifdef NO_TANGENT",
        "vec2 texelBump = dHdxy_fwd( sTextureBumpMap, vUv, uBumpMapFactor );",
        "vec2 channelBump = texelBump.rg;",
        "#else",
        "vec2 texelBump = textureGradient( sTextureBumpMap, vUv, uTextureBumpMapSize );",
        "vec2 channelBump = texelBump.rg * uBumpMapFactor;",
        "#endif",
        "#endif",
        "float channelRoughness = uRoughnessFactor;",
        "#ifdef USE_ROUGHNESSMAP",
        "float texelRoughness = textureIntensity( sTextureRoughness, vUv );",
        "channelRoughness *= texelRoughness;",
        "#endif",
        "float channelMetalness = uMetalnessFactor;",
        "#ifdef USE_METALNESSMAP",
        "float texelMetalness = textureIntensity( sTextureMetalness, vUv );",
        "channelMetalness *= texelMetalness;",
        "#endif",
        "#ifdef DOUBLE_SIDED",
        "float flipNormal = ( float( gl_FrontFacing ) * 2.0 - 1.0 );",
        "#else",
        "float flipNormal = 1.0;",
        "#endif",
        "#ifdef FLAT_SHADED",
        "vec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );",
        "vec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );",
        "vec3 normal = normalize( cross( fdx, fdy ) );",
        "#else",
        "vec3 normal = normalize( vNormal ) * flipNormal;",
        "#endif",
        "#ifdef USE_NORMALMAP",
        "#ifdef NO_TANGENT",
        "vec3 geoNormal = perturbNormal2Arb( -vViewPosition, normal, uNormalMapFactor, channelNormal );",
        "#else",
        "vec4 tangent = vTangent * flipNormal;",
        "vec3 geoNormal = mtexNspaceTangent( tangent, normal, uNormalMapFactor, channelNormal );",
        "#endif",
        "#elif defined( USE_BUMPMAP )",
        "#ifdef NO_TANGENT",
        "vec3 geoNormal = perturbNormalArb( -vViewPosition, normal, channelBump );",
        "#else",
        "vec4 tangent = vTangent * flipNormal;",
        "vec3 geoNormal = bumpMap( tangent, normal, channelBump );",
        "#endif",
        "#else",
        "vec3 geoNormal = normal;",
        "#endif",
        "vec3 totalEmissiveRadiance = sRGBToLinear( uEmissiveColor );",
        "#ifdef USE_EMISSIVEMAP",
        "vec3 emissiveColor = textureRGB( sTextureEmissive, vUv );",
        "emissiveColor = sRGBToLinear( emissiveColor );",
        "totalEmissiveRadiance *= emissiveColor;",
        "#endif",
        "vec3 totalHighlightColor = sRGBToLinear( vec3( 0.0 ) );",
        "#ifdef USE_COLOR",
        "vec3 highlightColor = sRGBToLinear( vColor );",
        "totalHighlightColor = vec3( 1.0 ) - highlightColor;",
        "#endif",
        "PhysicalMaterial material;",
        "material.diffuseColor = materialAlbedo.rgb * ( 1.0 - channelMetalness );",
        "float specularRoughnessCutoff = max( 1.e-4, channelRoughness );",
        "#ifdef USE_NORMALMAP",
        "float materialRoughness = adjustRoughnessNormalMap( specularRoughnessCutoff, channelNormal );",
        "materialRoughness = adjustRoughnessGeometry( materialRoughness, normal );",
        "#else",
        "float materialRoughness = adjustRoughnessGeometry( specularRoughnessCutoff, normal );",
        "#endif",
        "material.specularRoughness = clamp( channelRoughness, 0.04, 1.0 );",
        "float materialSpecularf0 = mix( 0.0, 0.08, channelSpecularF0 );",
        "material.specularColor = mix( vec3( materialSpecularf0 ), materialAlbedo.rgb, channelMetalness );",
        "GeometricContext geometry;",
        "geometry.position = - vViewPosition;",
        "geometry.normal = geoNormal;",
        "geometry.viewDir = normalize( vViewPosition );",
        "vec4 prepSpec = LightingFuncPrep( geometry.normal, geometry.viewDir, materialRoughness );",
        "IncidentLight directLight;",
        "#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )",
        "PointLight pointLight;",
        "for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {",
        "pointLight = pointLights[ i ];",
        "getPointDirectLightIrradiance( pointLight, geometry, directLight );",
        "#ifdef USE_SHADOWMAP",
        "directLight.color *= all( bvec2( pointLight.shadow, directLight.visible ) ) ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ] ) : 1.0;",
        "#endif",
        "RE_Direct( directLight, geometry, material, prepSpec, reflectedLight );",
        "}",
        "#endif",
        "#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )",
        "SpotLight spotLight;",
        "for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {",
        "spotLight = spotLights[ i ];",
        "getSpotDirectLightIrradiance( spotLight, geometry, directLight );",
        "#ifdef USE_SHADOWMAP",
        "directLight.color *= all( bvec2( spotLight.shadow, directLight.visible ) ) ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;",
        "#endif",
        "RE_Direct( directLight, geometry, material, prepSpec, reflectedLight );",
        "}",
        "#endif",
        "#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )",
        "DirectionalLight directionalLight;",
        "for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {",
        "directionalLight = directionalLights[ i ];",
        "getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );",
        "#ifdef USE_SHADOWMAP",
        "directLight.color *= all( bvec2( directionalLight.shadow, directLight.visible ) ) ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;",
        "#endif",
        "RE_Direct( directLight, geometry, material, prepSpec, reflectedLight );",
        "}",
        "#endif",
        "vec3 irradiance = ambientLightColor;",
        "#if ( NUM_HEMI_LIGHTS > 0 )",
        "for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {",
        "irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );",
        "}",
        "#endif",
        "#if defined( USE_ENVIRONMENTMAP )",
        "mat3 envTrans = environmentTransformPBR( viewMatrix * uEnvironmentTransform );",
        "reflectedLight.indirectDiffuse = irradiance + computeIBLDiffuseUE4( geometry.normal, material.diffuseColor, envTrans, uDiffuseSPH, uEnvironmentExposure );",
        "vec3 radiance = approximateSpecularIBL( geometry.normal, geometry.viewDir, materialRoughness, material.specularColor, envTrans, uEnvironment, uTextureEnvironmentSpecularPBRLodRange, uTextureEnvironmentSpecularPBRTextureSize, normal, sIntegrateBRDF, uSpecularPeak, uOcclusionHorizon, uEnvironmentExposure );",
        "reflectedLight.indirectSpecular += radiance;",
        "#endif",
        "#ifdef USE_AOMAP",
        "float texelAO = textureIntensity( sTextureAO, vUv );",
        "float channelAO = mix( float( 1.0 ), texelAO, uAOFactor );",
        "reflectedLight.indirectDiffuse *= channelAO;",
        "#if defined( USE_ENVIRONMENTMAP )",
        "reflectedLight.indirectSpecular *= specularOcclusion( uOccludeSpecular, channelAO, geometry.normal, geometry.viewDir );",
        "#endif",
        "#endif",
        "vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance + totalHighlightColor;",
        "gl_FragColor = vec4( outgoingLight, materialAlbedo.a );",
        "#ifdef PREMULTIPLIED_ALPHA",
        "gl_FragColor.rgb *= gl_FragColor.a;",
        "#endif",
        "#if defined( TONE_MAPPING )",
        "gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );",
        "#endif",
        "gl_FragColor = linearTosRGB( gl_FragColor );",
        "#ifdef USE_FOG",
        "#ifdef USE_LOGDEPTHBUF_EXT",
        "float depth = gl_FragDepthEXT / gl_FragCoord.w;",
        "#else",
        "float depth = gl_FragCoord.z / gl_FragCoord.w;",
        "#endif",
        "#ifdef FOG_EXP2",
        "float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * depth * depth * INV_LOG2 ) );",
        "#else",
        "float fogFactor = smoothstep( fogNear, fogFar, depth );",
        "#endif",
        "gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );",
        "#endif",
        "}",
      ].join("\n"),
    },
  }),
  (THREE.Globe = function () {
    (THREE.Group.call(this),
      (this.type = "Globe"),
      (this.radii = []),
      (this.shellCollisionMesh = null),
      (this.intersectableObjects = []),
      (this.hasHotspots = !1),
      (this.hotspotCluster = null),
      (this.cutawayGlobe = null),
      (this.cutawayDelay = null),
      (this.cutawayDuration = 0.5),
      (this.cutawayOpen = !1),
      (this.innerShellsHidden = !1),
      (this.shells = []),
      (this.environmentExposure = 0.75));
  }),
  (THREE.Globe.prototype = Object.create(THREE.Group.prototype)),
  (THREE.Globe.prototype.constructor = THREE.Globe),
  (THREE.Globe.prototype.getRadii = function () {
    if (this.radii.length) return this.radii;
    for (
      var e = this.getObjectByName("shells"), t = 0;
      t < e.children.length;
      t++
    )
      (e.children[t].geometry.computeBoundingBox(),
        this.radii.push(e.children[t].geometry.boundingBox.getSize().x / 2));
    return this.radii;
  }),
  (THREE.Globe.prototype.getLargestRadius = function () {
    var e,
      t = 0,
      n = this.getRadii(),
      i = n.length;
    for (e = 0; e < i; e++) n[e] > t && (t = n[e]);
    return t;
  }),
  (THREE.Globe.prototype.generateCollisionObjects = function (e, t) {
    this.hasHotspots = t;
    var n = new THREE.ShellGeometry({
        radius: 1.0025 * this.getLargestRadius(),
        widthSegments: 60,
        heightSegments: 30,
        flavor: "openSurface",
        phiStart: THREE.Math.degToRad(0),
        phiLength: THREE.Math.degToRad(270),
        thetaStart: THREE.Math.degToRad(0),
        thetaLength: THREE.Math.degToRad(180),
        cutaway: !1,
      }),
      i = new THREE.MeshBasicMaterial({ visible: !1 });
    ((this.shellCollisionMesh = new THREE.Mesh(n, i)),
      (this.shellCollisionMesh.name = "shell collision mesh"),
      (this.shellCollisionMesh.visible = !0),
      this.intersectableObjects.push(this.shellCollisionMesh),
      this.add(this.shellCollisionMesh),
      t && this.initHotspots(e));
  }),
  (THREE.Globe.prototype.initHotspots = function (e) {
    function t(e, t, n) {
      ((e = (e * Math.PI) / 180), (t = (t * Math.PI) / 180));
      var i = n * Math.cos(e) * Math.cos(t),
        r = -n * Math.cos(e) * Math.sin(t),
        a = n * Math.sin(e);
      return new THREE.Vector3(i, a, r);
    }
    var n = document.getElementsByClassName("webgl_globe_hotspot_container"),
      i = document.getElementsByClassName("hotspot_wrapper"),
      r = 1.0125 * this.getLargestRadius(),
      a = [];
    ((this.hotspotCluster = new THREE.HotspotCluster(
      Mb3D.CameraRig.camera(),
      this.intersectableObjects,
      n[0],
    )),
      (this.hotspotCluster.rotation.y = THREE.Math.degToRad(e)),
      (this.hotspotCluster.userData.autoHide = !1),
      this.hotspotCluster.scale.set(0, 0, 0));
    for (var o = 0; o < i.length; o++) {
      var s;
      if ("core" === $(i[o]).data("type"))
        a[o] = new THREE.Vector3().fromArray($(i[o]).data("position"));
      else {
        var l = $(i[o]).data("position")[0],
          c = $(i[o]).data("position")[1];
        a[o] = t(l, c, r);
      }
      ((s = new THREE.Hotspot({
        element: i[o],
        type: $(i[o]).data("type"),
      })).position.copy(a[o]),
        this.hotspotCluster.add(s));
    }
    (this.hideHotspotType("core"), this.add(this.hotspotCluster));
  }),
  (THREE.Globe.prototype.showHotspotType = function (e) {
    if (this.hasHotspots)
      if ("string" == typeof e)
        for (var t = 0; t < this.hotspotCluster.children.length; t++)
          this.hotspotCluster.children[t].userData.type === e &&
            (this.hotspotCluster.children[t].userData.typeIsSelected = !0);
      else if (Array.isArray(e))
        for (t = 0; t < e.length; t++)
          for (var n = 0; n < this.hotspotCluster.children.length; n++)
            this.hotspotCluster.children[n].userData.type === e[t] &&
              (this.hotspotCluster.children[n].userData.typeIsSelected = !0);
      else
        console.error(
          "THREE.Globe.hideHotspotType: Requires argumants of type string and array only",
        );
  }),
  (THREE.Globe.prototype.hideHotspotType = function (e) {
    if (this.hasHotspots)
      if ("string" == typeof e)
        for (var t = 0; t < this.hotspotCluster.children.length; t++)
          this.hotspotCluster.children[t].userData.type === e &&
            (this.hotspotCluster.children[t].userData.typeIsSelected = !1);
      else if (Array.isArray(e))
        for (t = 0; t < e.length; t++)
          for (var n = 0; n < this.hotspotCluster.children.length; n++)
            this.hotspotCluster.children[n].userData.type === e[t] &&
              (this.hotspotCluster.children[n].userData.typeIsSelected = !1);
      else
        console.error(
          "THREE.Globe.hideHotspotType: Requires argumants of type string and array only",
        );
  }),
  (THREE.Globe.prototype.toggleHotspotByType = function (e, t) {
    if (this.hasHotspots) {
      Array.isArray(e) && Array.isArray(e)
        ? (this.showHotspotType(e), this.hideHotspotType(this.symmDiff(e, t)))
        : console.error(
            "THREE.Globe.toggleHotspotByType: Requires two arguments of type array",
          );
    }
  }),
  (THREE.Globe.prototype.symmDiff = function (e, t) {
    for (var n = [], i = 0; i < e.length; i++)
      -1 === t.indexOf(e[i]) && n.push(e[i]);
    for (i = 0; i < t.length; i++) -1 === e.indexOf(t[i]) && n.push(t[i]);
    return n;
  }),
  (THREE.Globe.prototype.showSurfaceHotspots = function () {
    if (this.hasHotspots)
      for (var e = 0; e < this.hotspotCluster.children.length; e++)
        "core" != this.hotspotCluster.children[e].userData.type &&
          (this.hotspotCluster.children[e].userData.typeIsSelected = !0);
  }),
  (THREE.Globe.prototype.hideSurfaceHotspots = function () {
    if (this.hasHotspots)
      for (var e = 0; e < this.hotspotCluster.children.length; e++)
        "core" != this.hotspotCluster.children[e].userData.type &&
          (this.hotspotCluster.children[e].userData.typeIsSelected = !1);
  }),
  (THREE.Globe.prototype.expandHotspots = function () {
    if (this.hasHotspots) {
      var e = this;
      TweenLite.to(this.hotspotCluster.scale, 1, {
        x: 1,
        y: 1,
        z: 1,
        ease: Back.easeOut,
        delay: 0.5,
        onStart: function () {
          (e.hotspotCluster.show(), e.hotspotCluster.setHotspotContainerSize());
        },
      });
    }
  }),
  (THREE.Globe.prototype.retractHotspots = function () {
    this.hasHotspots &&
      TweenLite.to(this.hotspotCluster.scale, 0.5, {
        x: 0,
        y: 0,
        z: 0,
        ease: Back.easeIn,
      });
  }),
  (THREE.Globe.prototype.initCutawayGlobeAnimation = function () {
    ((this.cutawayGlobe = new TimelineMax({
      paused: !0,
      onComplete: this.onCutawayComplete,
      onCompleteScope: this,
      onReverseComplete: this.onReverseCutawayComplete,
      onReverseCompleteScope: this,
    })),
      (this.shells = this.getObjectByName("shells")));
    for (
      var e = this.shells,
        t = e.children.length - 1,
        n = [],
        i = 0.02 * this.getLargestRadius(),
        r = i,
        a = [],
        o = this.cutawayDuration,
        s = o * t,
        l = 0;
      l < t;
      l++
    )
      ((r -= i), (n[l] = r), (s -= o), (a[l] = s));
    for (l = t; l >= 1; l--)
      for (var c = e.children[l].material.length, u = 0; u < c; u++)
        this.cutawayGlobe.to(
          e.children[l].material[u].uniforms.uCutawayThreshold,
          this.cutawayDuration,
          { value: n[l - 1], ease: Power3.easeOut },
          a[l - 1],
        );
  }),
  (THREE.Globe.prototype.onCutawayComplete = function () {
    this.hasHotspots &&
      (setTimeout(
        function () {
          this.hotspotCluster.show();
        }.bind(this),
        500,
      ),
      this.expandHotspots());
  }),
  (THREE.Globe.prototype.onReverseCutawayComplete = function () {
    this.hasHotspots &&
      (setTimeout(
        function () {
          this.hotspotCluster.show();
        }.bind(this),
        500,
      ),
      this.expandHotspots(),
      this.hideInnerShells());
  }),
  (THREE.Globe.prototype.revealCutaway = function () {
    this.cutawayOpen ||
      ((this.cutawayOpen = !0),
      this.prepCollisionMeshesForReveal(),
      this.cutawayGlobe.play());
  }),
  (THREE.Globe.prototype.consealCutaway = function () {
    this.cutawayOpen &&
      ((this.cutawayOpen = !1),
      this.prepCollisionMeshesForConseal(),
      this.cutawayGlobe.reverse());
  }),
  (THREE.Globe.prototype.resetCutaway = function () {
    for (var e = this.shells, t = e.children.length, n = 1; n < t; n++)
      for (var i = e.children[n].material.length, r = 0; r < i; r++)
        e.children[n].material[r].uniforms.uCutawayThreshold.value =
          this.getLargestRadius() + 0.05 * this.getLargestRadius();
  }),
  (THREE.Globe.prototype.prepCollisionMeshesForReveal = function () {
    (this.showInnerShells(),
      this.hasHotspots && (this.hotspotCluster.isCutaway = !0));
  }),
  (THREE.Globe.prototype.prepCollisionMeshesForConseal = function () {
    this.hasHotspots && (this.hotspotCluster.isCutaway = !1);
  }),
  (THREE.Globe.prototype.hideInnerShells = function () {
    this.innerShellsHidden = !0;
    for (
      var e = this.getObjectByName("shells"), t = 0;
      t < e.children.length - 1;
      t++
    )
      e.children[t].visible = !1;
  }),
  (THREE.Globe.prototype.showInnerShells = function () {
    this.innerShellsHidden = !1;
    for (
      var e = this.getObjectByName("shells"), t = 0;
      t < e.children.length - 1;
      t++
    )
      e.children[t].visible = !0;
  }),
  (THREE.Globe.prototype.update = function () {
    this.hasHotspots && this.hotspotCluster.update();
  }),
  (THREE.Shell = function (e) {
    (THREE.Mesh.call(this),
      (this.type = "Shell"),
      (this.geometry = void 0 !== e ? e : null));
  }),
  (THREE.Shell.prototype = Object.create(THREE.Mesh.prototype)),
  (THREE.Shell.prototype.constructor = THREE.Shell),
  (THREE.ShellBufferGeometry = function (e) {
    (THREE.BufferGeometry.call(this), (this.type = "ShellBufferGeometry"));
    var t = void 0 !== (e = e || {}).radius ? e.radius : 1,
      n = void 0 !== e.widthSegments ? e.widthSegments : 48,
      i = void 0 !== e.heightSegments ? e.heightSegments : 24,
      r =
        (void 0 !== e.flavor && e.flavor,
        void 0 !== e.phiStart ? e.phiStart : 0),
      a = void 0 !== e.phiLength ? e.phiLength : 2 * Math.PI,
      o = void 0 !== e.thetaStart ? e.thetaStart : 0,
      s = void 0 !== e.thetaLength ? e.thetaLength : Math.PI;
    (void 0 !== e.thickness && e.thickness,
      void 0 !== e.cutaway && e.cutaway,
      new THREE.Matrix4());
    ((t = t || 50),
      (n = Math.max(3, Math.floor(n) || 8)),
      (i = Math.max(2, Math.floor(i) || 6)),
      (r = void 0 !== r ? r : 0),
      (a = void 0 !== a ? a : 2 * Math.PI));
    var l,
      c,
      u = (o = void 0 !== o ? o : 0) + (s = void 0 !== s ? s : Math.PI),
      h = 0,
      d = [],
      p = new THREE.Vector3(),
      f = new THREE.Vector3(),
      m = [],
      v = [],
      g = [],
      _ = [];
    for (c = 0; c <= i; c++) {
      var y = [],
        b = c / i;
      for (l = 0; l <= n; l++) {
        var w = l / n;
        ((p.x = -t * Math.cos(r + w * a) * Math.sin(o + b * s)),
          (p.y = t * Math.cos(o + b * s)),
          (p.z = t * Math.sin(r + w * a) * Math.sin(o + b * s)),
          v.push(p.x, p.y, p.z),
          f.set(p.x, p.y, p.z).normalize(),
          g.push(f.x, f.y, f.z),
          _.push(w, 1 - b),
          y.push(h++));
      }
      d.push(y);
    }
    for (c = 0; c < i; c++)
      for (l = 0; l < n; l++) {
        var M = d[c][l + 1],
          E = d[c][l],
          x = d[c + 1][l],
          T = d[c + 1][l + 1];
        ((0 !== c || o > 0) && m.push(M, E, T),
          (c !== i - 1 || u < Math.PI) && m.push(E, x, T));
      }
    (this.setIndex(m),
      this.addAttribute("position", new THREE.Float32BufferAttribute(v, 3)),
      this.addAttribute("normal", new THREE.Float32BufferAttribute(g, 3)),
      this.addAttribute("uv", new THREE.Float32BufferAttribute(_, 2)));
  }),
  (THREE.ShellBufferGeometry.prototype = Object.create(
    THREE.BufferGeometry.prototype,
  )),
  (THREE.ShellBufferGeometry.prototype.constructor = THREE.ShellBufferGeometry),
  (THREE.ShellGeometry = function (e) {
    function t() {
      return (r(), !0 === g ? (a(), s) : s);
    }
    function n() {
      r();
      var e = new THREE.SphereGeometry(l - v, c, u);
      return (o(e), s.merge(e, _), !0 === g ? (a(), s) : s);
    }
    function i() {
      return (
        (s = new THREE.SphereGeometry(l, c, u, d, p, f, m)).rotateY(Math.PI),
        s
      );
    }
    function r() {
      (s = new THREE.SphereGeometry(l, c, u)).type = "shellGeometry";
    }
    function a() {
      var e = new THREE.PlaneGeometry(2 * l, 2 * l),
        t = e.clone();
      (e.rotateY(0 * Math.PI),
        t.rotateY(0.5 * Math.PI),
        s.merge(t, _, 1),
        s.merge(e, _, 2));
    }
    function o(e) {
      for (var t = 0; t < e.faces.length; t++) {
        var n = e.faces[t],
          i = n.a;
        ((n.a = n.c), (n.c = i));
      }
      (e.computeFaceNormals(), e.computeVertexNormals());
      var r = e.faceVertexUvs[0];
      for (t = 0; t < r.length; t++) {
        i = r[t][0];
        ((r[t][0] = r[t][2]), (r[t][2] = i));
      }
    }
    var s,
      l = void 0 !== (e = e || {}).radius ? e.radius : 1,
      c = void 0 !== e.widthSegments ? e.widthSegments : 48,
      u = void 0 !== e.heightSegments ? e.heightSegments : 24,
      h = void 0 !== e.flavor ? e.flavor : "singleSurface",
      d = void 0 !== e.phiStart ? e.phiStart : 0,
      p = void 0 !== e.phiLength ? e.phiLength : 2 * Math.PI,
      f = void 0 !== e.thetaStart ? e.thetaStart : 0,
      m = void 0 !== e.thetaLength ? e.thetaLength : Math.PI,
      v = void 0 !== e.thickness ? e.thickness : 0.01,
      g = void 0 !== e.cutaway && e.cutaway,
      _ = new THREE.Matrix4();
    switch (h) {
      case "singleSurface":
        return t();
      case "doubleSurface":
        return n();
      case "openSurface":
        return i();
      default:
        console.error(
          "the flavor of planet geometry you requested does not exist",
        );
    }
  }),
  (THREE.ShellGeometry.prototype.constructor = THREE.ShellGeometry),
  (Mb3D.GlobeModel = (function () {
    var e = !1,
      t = {},
      n = "/assets/images/",
      i = "/assets/images/",
      r = "/assets/geometry/",
      a = {},
      o = {},
      s = {},
      l = {},
      c = {},
      u = function (e, n) {
        var i;
        if (1 === arguments.length)
          "function" == typeof e &&
            ((n = e), Mb3D.GlobeModel.loadDataTextures(t, n));
        else if (2 === arguments.length) {
          var r = b(a),
            c = b(o),
            u = b(s),
            h = b(l),
            d = _.filter(t.components, function (t) {
              return _.contains(e, t.name);
            });
          d.length ||
            console.log(
              "Mb3D.GlobeModel.loadComponents: Requested component/s, " +
                e +
                " not found in data",
            );
          var p = E("meshes", h, w("meshes", d)),
            f = E("materials", u, w("materials", p)),
            m = E("textures", c, M("uniforms", f)),
            v = [];
          _.contains(r, t.environment.environmentMap) || (v = t.dataTextures);
          var g = t.environment,
            y = {};
          function b(e) {
            return _.map(e, function (e, t) {
              return t;
            });
          }
          function w(e, t) {
            return _.chain(t)
              .map(function (t) {
                return t[e];
              })
              .flatten()
              .unique()
              .value();
          }
          function M(e, t) {
            return _.chain(t)
              .map(function (t) {
                return t[e];
              })
              .map(function (e) {
                return _.values(e);
              })
              .flatten()
              .unique()
              .value();
          }
          function E(e, n, i) {
            var r = _.reject(t[e], function (e) {
              return _.contains(n, e.name);
            });
            return _.filter(r, function (e) {
              return _.contains(i, e.name);
            });
          }
          (!1 === t.loaded && (y = t.options),
            (i = {
              loaded: t.loaded,
              options: y,
              environment: g,
              components: d,
              meshes: p,
              materials: f,
              textures: m,
              dataTextures: v,
            }),
            Mb3D.GlobeModel.loadDataTextures(i, n));
        }
      },
      h = function (e, t) {
        function n(e, t, n) {
          ((a[t] = e),
            r[n].width && (a[t].width = r[n].width),
            r[n].height && (a[t].height = r[n].height),
            r[n].format && (a[t].format = THREE[r[n].format]),
            r[n].type && (a[t].type = THREE[r[n].type]),
            r[n].mapping && (a[t].mapping = THREE[r[n].mapping]),
            r[n].wrapS && (a[t].wrapS = THREE[r[n].wrapS]),
            r[n].wrapT && (a[t].wrapT = THREE[r[n].wrapT]),
            r[n].magFilter && (a[t].magFilter = THREE[r[n].magFilter]),
            r[n].minFilter && (a[t].minFilter = THREE[r[n].minFilter]),
            r[n].anisotropy && (a[t].anisotropy = r[n].anisotropy),
            r[n].flipY && (a[t].flipY = r[n].flipY),
            (a[t].image = {
              data: a[t].data,
              width: a[t].width,
              height: a[t].height,
            }),
            (a[t].needsUpdate = !0));
        }
        if (e.dataTextures.length) {
          var r = e.dataTextures,
            o = new THREE.LoadingManager();
          o.onProgress = function (n, i, r) {
            ($(".load_bar").css("width", (i / r) * 100 + "%"),
              i === r &&
                ($(".load_bar").css("width", "0"),
                console.log("data textures loaded"),
                Mb3D.GlobeModel.loadTextures(e, t)));
          };
          var s = new THREE.DataTextureLoader(o),
            l = new THREE.BinaryGZTextureLoader(o);
          !(function () {
            for (var e = 0; e < r.length; e++)
              !(function (e) {
                "gz" == r[e].compression
                  ? l.load(i + r[e].url, function (t) {
                      n(t, r[e].name, e);
                    })
                  : s.load(i + r[e].url, function (t) {
                      n(t, r[e].name, e);
                    });
              })(e);
          })();
        } else Mb3D.GlobeModel.loadTextures(e, t);
      },
      d = function (e, t) {
        function i(e, t, n) {
          ((o[t] = e),
            r[n].format && (o[t].format = THREE[r[n].format]),
            r[n].wrapS && (o[t].wrapS = THREE[r[n].wrapS]),
            r[n].wrapT && (o[t].wrapT = THREE[r[n].wrapT]),
            r[n].magFilter && (o[t].magFilter = THREE[r[n].magFilter]),
            r[n].minFilter && (o[t].minFilter = THREE[r[n].minFilter]),
            r[n].anisotropy && (o[t].anisotropy = r[n].anisotropy),
            r[n].flipY && (o[t].flipY = r[n].flipY),
            r[n].premultiplyAlpha &&
              (o[t].premultiplyAlpha = r[n].premultiplyAlpha));
        }
        if (e.textures.length) {
          var r = e.textures,
            a = new THREE.LoadingManager();
          a.onProgress = function (n, i, r) {
            ($(".load_bar").css("width", (i / r) * 100 + "%"),
              i === r &&
                ($(".load_bar").css("width", "0"),
                console.log("textures loaded"),
                Mb3D.GlobeModel.loadMaterials(e),
                Mb3D.GlobeModel.loadGeometry(e, t)));
          };
          var s = new THREE.TextureLoader(a);
          !(function () {
            for (var e = 0; e < r.length; e++)
              !(function (e) {
                s.load(n + r[e].url, function (t) {
                  i(t, r[e].name, e);
                });
              })(e);
          })();
        } else
          (Mb3D.GlobeModel.loadMaterials(e),
            Mb3D.GlobeModel.loadGeometry(e, t));
      },
      p = function (e) {
        function t(t) {
          return (
            (mtl_parameters = {}),
            "pbr" == t.type
              ? ((mtl_parameters.side = t.side),
                (mtl_parameters.transparent = t.transparent),
                (mtl_parameters.baseColorMap = o[t.textures.baseColorMap]),
                (mtl_parameters.roughnessMap = o[t.textures.roughnessMap]),
                (mtl_parameters.normalMap = o[t.textures.normalMap]),
                (mtl_parameters.metallicMap = o[t.textures.metallicMap]),
                (mtl_parameters.opacityMap = o[t.textures.opacityMap]),
                (mtl_parameters.emitColorMap = o[t.textures.emitColorMap]),
                (mtl_parameters.sSpecularPBR = a[e.environment.environmentMap]),
                (mtl_parameters.environmentExposure = t.environmentExposure),
                (mtl_parameters.diffuseSPH = e.environment.diffuseSPH),
                n(mtl_parameters))
              : "pbr-cut" == t.type
                ? ((mtl_parameters.side = t.side),
                  (mtl_parameters.transparent = t.transparent),
                  (mtl_parameters.lights = t.lights),
                  (mtl_parameters.needsTangents = t.needsTangents),
                  (mtl_parameters.isDecal = t.isDecal),
                  (mtl_parameters.cutawayType = t.cutawayType),
                  (mtl_parameters.cutawayAxis = t.cutawayAxis),
                  (mtl_parameters.uCutawayRadius = t.uniforms.uCutawayRadius),
                  (mtl_parameters.uCutawayThreshold =
                    t.uniforms.uCutawayThreshold),
                  (mtl_parameters.fogDensity = t.uniforms.fogDensity),
                  (mtl_parameters.fogNear = t.uniforms.fogNear),
                  (mtl_parameters.fogFar = t.uniforms.fogFar),
                  (mtl_parameters.fogColor = t.uniforms.fogColor),
                  (mtl_parameters.uOffsetRepeat = t.uniforms.uOffsetRepeat),
                  (mtl_parameters.uAlbedoColor = t.uniforms.uAlbedoColor),
                  (mtl_parameters.uMetalnessFactor =
                    t.uniforms.uMetalnessFactor),
                  (mtl_parameters.uAOFactor = t.uniforms.uAOFactor),
                  (mtl_parameters.uFlipY = t.uniforms.uFlipY),
                  (mtl_parameters.uNormalMapFactor =
                    t.uniforms.uNormalMapFactor),
                  (mtl_parameters.uTextureBumpMapSize =
                    t.uniforms.uTextureBumpMapSize),
                  (mtl_parameters.uBumpMapFactor = t.uniforms.uBumpMapFactor),
                  (mtl_parameters.uRoughnessFactor =
                    t.uniforms.uRoughnessFactor),
                  (mtl_parameters.uEmissiveColor = t.uniforms.uEmissiveColor),
                  (mtl_parameters.uOpacityFactor = t.uniforms.uOpacityFactor),
                  (mtl_parameters.uSpecularF0Factor =
                    t.uniforms.uSpecularF0Factor),
                  (mtl_parameters.uAlbedoBlendFactor =
                    t.uniforms.uAlbedoBlendFactor),
                  (mtl_parameters.sTextureAlbedo =
                    o[t.uniforms.sTextureAlbedo]),
                  (mtl_parameters.sTextureMetalness =
                    o[t.uniforms.sTextureMetalness]),
                  (mtl_parameters.sTextureAO = o[t.uniforms.sTextureAO]),
                  (mtl_parameters.sTextureNormalMap =
                    o[t.uniforms.sTextureNormalMap]),
                  (mtl_parameters.sTextureBumpMap =
                    o[t.uniforms.sTextureBumpMap]),
                  (mtl_parameters.sTextureRoughness =
                    o[t.uniforms.sTextureRoughness]),
                  (mtl_parameters.sTextureEmissive =
                    o[t.uniforms.sTextureEmissive]),
                  (mtl_parameters.sTextureOpacity =
                    o[t.uniforms.sTextureOpacity]),
                  (mtl_parameters.sTextureSpecularF0 =
                    o[t.uniforms.sTextureSpecularF0]),
                  (mtl_parameters.sTextureAlbedoBlend =
                    o[t.uniforms.sTextureAlbedoBlend]),
                  (mtl_parameters.uOccludeSpecular =
                    t.uniforms.uOccludeSpecular),
                  (mtl_parameters.sTexturDisplacement =
                    o[t.uniforms.sTexturDisplacement]),
                  (mtl_parameters.uDisplacementScale =
                    t.uniforms.uDisplacementScale),
                  (mtl_parameters.uDisplacementBias =
                    t.uniforms.uDisplacementBias),
                  (mtl_parameters.uDiffuseSPH = m(e.environment.diffuseSPH)),
                  (mtl_parameters.uEnvironment =
                    a[e.environment.environmentMap]),
                  (mtl_parameters.uEnvironmentTransform =
                    e.environment.environmentRotation),
                  (mtl_parameters.sIntegrateBRDF =
                    a[e.environment.integrateBRDFMap]),
                  (mtl_parameters.uSpecularPeak = t.uniforms.uSpecularPeak),
                  (mtl_parameters.uOcclusionHorizon =
                    t.uniforms.uOcclusionHorizon),
                  (mtl_parameters.uEnvironmentExposure =
                    e.environment.environmentExposure),
                  i(mtl_parameters))
                : "pbr-terrain" == t.type
                  ? ((mtl_parameters.side = t.side),
                    (mtl_parameters.transparent = t.transparent),
                    (mtl_parameters.shadowColor = new THREE.Color().fromArray(
                      t.textures.shadowColor,
                    )),
                    (mtl_parameters.materialScaleA = t.textures.materialScaleA),
                    (mtl_parameters.materialScaleB = t.textures.materialScaleB),
                    (mtl_parameters.baseColorMapA =
                      o[t.textures.baseColorMapA]),
                    (mtl_parameters.baseColorMapB =
                      o[t.textures.baseColorMapB]),
                    (mtl_parameters.normalMapA = o[t.textures.normalMapA]),
                    (mtl_parameters.normalMapB = o[t.textures.normalMapB]),
                    (mtl_parameters.roughnessMap = o[t.textures.roughnessMap]),
                    (mtl_parameters.baseNormalMap =
                      o[t.textures.baseNormalMap]),
                    (mtl_parameters.lightMap = o[t.textures.lightMap]),
                    (mtl_parameters.metallicMap = o[t.textures.metallicMap]),
                    (mtl_parameters.splatMap = o[t.textures.splatMap]),
                    (mtl_parameters.emitColorMap = o[t.textures.emitColorMap]),
                    (mtl_parameters.sSpecularPBR =
                      a[e.environment.environmentMap]),
                    (mtl_parameters.sIntegrateBRDF =
                      a[e.environment.integrateBRDFMap]),
                    (mtl_parameters.environmentExposure =
                      e.environment.environmentExposure),
                    (mtl_parameters.diffuseSPH = m(e.environment.diffuseSPH)),
                    r(mtl_parameters))
                  : "pbr-terrain-2" == t.type
                    ? ((mtl_parameters.side = t.side),
                      (mtl_parameters.transparent = t.transparent),
                      (mtl_parameters.needsTangents = t.needsTangents),
                      (mtl_parameters.fogDensity = t.uniforms.fogDensity),
                      (mtl_parameters.fogNear = t.uniforms.fogNear),
                      (mtl_parameters.fogFar = t.uniforms.fogFar),
                      (mtl_parameters.fogColor = t.uniforms.fogColor),
                      (mtl_parameters.uOffsetRepeat = t.uniforms.uOffsetRepeat),
                      (mtl_parameters.uAlbedoColor = t.uniforms.uAlbedoColor),
                      (mtl_parameters.uMetalnessFactor =
                        t.uniforms.uMetalnessFactor),
                      (mtl_parameters.uAOFactor = t.uniforms.uAOFactor),
                      (mtl_parameters.uFlipY = t.uniforms.uFlipY),
                      (mtl_parameters.uNormalMapFactor =
                        t.uniforms.uNormalMapFactor),
                      (mtl_parameters.uTextureBumpMapSize =
                        t.uniforms.uTextureBumpMapSize),
                      (mtl_parameters.uBumpMapFactor =
                        t.uniforms.uBumpMapFactor),
                      (mtl_parameters.uRoughnessFactor =
                        t.uniforms.uRoughnessFactor),
                      (mtl_parameters.uEmissiveColor =
                        t.uniforms.uEmissiveColor),
                      (mtl_parameters.uOpacityFactor =
                        t.uniforms.uOpacityFactor),
                      (mtl_parameters.uSpecularF0Factor =
                        t.uniforms.uSpecularF0Factor),
                      (mtl_parameters.sTextureAlbedo =
                        o[t.uniforms.sTextureAlbedo]),
                      (mtl_parameters.sTextureMetalness =
                        o[t.uniforms.sTextureMetalness]),
                      (mtl_parameters.sTextureAO = o[t.uniforms.sTextureAO]),
                      (mtl_parameters.sTextureNormalMap =
                        o[t.uniforms.sTextureNormalMap]),
                      (mtl_parameters.sTextureBumpMap =
                        o[t.uniforms.sTextureBumpMap]),
                      (mtl_parameters.sTextureRoughness =
                        o[t.uniforms.sTextureRoughness]),
                      (mtl_parameters.sTextureEmissive =
                        o[t.uniforms.sTextureEmissive]),
                      (mtl_parameters.sTextureOpacity =
                        o[t.uniforms.sTextureOpacity]),
                      (mtl_parameters.sTextureSpecularF0 =
                        o[t.uniforms.sTextureSpecularF0]),
                      (mtl_parameters.uOccludeSpecular =
                        t.uniforms.uOccludeSpecular),
                      (mtl_parameters.sTexturDisplacement =
                        o[t.uniforms.sTexturDisplacement]),
                      (mtl_parameters.uDisplacementScale =
                        t.uniforms.uDisplacementScale),
                      (mtl_parameters.uDisplacementBias =
                        t.uniforms.uDisplacementBias),
                      (mtl_parameters.uDiffuseSPH = m(
                        e.environment.diffuseSPH,
                      )),
                      (mtl_parameters.uEnvironment =
                        a[e.environment.environmentMap]),
                      (mtl_parameters.sIntegrateBRDF =
                        a[e.environment.integrateBRDFMap]),
                      (mtl_parameters.uSpecularPeak = t.uniforms.uSpecularPeak),
                      (mtl_parameters.uOcclusionHorizon =
                        t.uniforms.uOcclusionHorizon),
                      (mtl_parameters.uEnvironmentExposure =
                        t.uniforms.uEnvironmentExposure),
                      l(mtl_parameters))
                    : "pbr-plant" == t.type
                      ? ((mtl_parameters.side = t.side),
                        (mtl_parameters.transparent = t.transparent),
                        (mtl_parameters.shadowColor = t.textures.shadowColor),
                        (mtl_parameters.baseColorMap =
                          o[t.textures.baseColorMap]),
                        (mtl_parameters.environmentExposure =
                          e.environment.environmentExposure),
                        (mtl_parameters.diffuseSPH = m(
                          e.environment.diffuseSPH,
                        )),
                        c(mtl_parameters))
                      : "pbr-2" == t.type
                        ? ((mtl_parameters.side = t.side),
                          (mtl_parameters.transparent = t.transparent),
                          (mtl_parameters.needsTangents = t.needsTangents),
                          (mtl_parameters.isDecal = t.isDecal),
                          (mtl_parameters.fogDensity = t.uniforms.fogDensity),
                          (mtl_parameters.fogNear = t.uniforms.fogNear),
                          (mtl_parameters.fogFar = t.uniforms.fogFar),
                          (mtl_parameters.fogColor = t.uniforms.fogColor),
                          (mtl_parameters.uOffsetRepeat =
                            t.uniforms.uOffsetRepeat),
                          (mtl_parameters.uAlbedoColor =
                            t.uniforms.uAlbedoColor),
                          (mtl_parameters.uMetalnessFactor =
                            t.uniforms.uMetalnessFactor),
                          (mtl_parameters.uAOFactor = t.uniforms.uAOFactor),
                          (mtl_parameters.uFlipY = t.uniforms.uFlipY),
                          (mtl_parameters.uNormalMapFactor =
                            t.uniforms.uNormalMapFactor),
                          (mtl_parameters.uTextureBumpMapSize =
                            t.uniforms.uTextureBumpMapSize),
                          (mtl_parameters.uBumpMapFactor =
                            t.uniforms.uBumpMapFactor),
                          (mtl_parameters.uRoughnessFactor =
                            t.uniforms.uRoughnessFactor),
                          (mtl_parameters.uEmissiveColor =
                            t.uniforms.uEmissiveColor),
                          (mtl_parameters.uOpacityFactor =
                            t.uniforms.uOpacityFactor),
                          (mtl_parameters.uSpecularF0Factor =
                            t.uniforms.uSpecularF0Factor),
                          (mtl_parameters.sTextureAlbedo =
                            o[t.uniforms.sTextureAlbedo]),
                          (mtl_parameters.sTextureMetalness =
                            o[t.uniforms.sTextureMetalness]),
                          (mtl_parameters.sTextureAO =
                            o[t.uniforms.sTextureAO]),
                          (mtl_parameters.sTextureNormalMap =
                            o[t.uniforms.sTextureNormalMap]),
                          (mtl_parameters.sTextureBumpMap =
                            o[t.uniforms.sTextureBumpMap]),
                          (mtl_parameters.sTextureRoughness =
                            o[t.uniforms.sTextureRoughness]),
                          (mtl_parameters.sTextureEmissive =
                            o[t.uniforms.sTextureEmissive]),
                          (mtl_parameters.sTextureOpacity =
                            o[t.uniforms.sTextureOpacity]),
                          (mtl_parameters.sTextureSpecularF0 =
                            o[t.uniforms.sTextureSpecularF0]),
                          (mtl_parameters.uOccludeSpecular =
                            t.uniforms.uOccludeSpecular),
                          (mtl_parameters.sTexturDisplacement =
                            o[t.uniforms.sTexturDisplacement]),
                          (mtl_parameters.uDisplacementScale =
                            t.uniforms.uDisplacementScale),
                          (mtl_parameters.uDisplacementBias =
                            t.uniforms.uDisplacementBias),
                          (mtl_parameters.uDiffuseSPH = m(
                            e.environment.diffuseSPH,
                          )),
                          (mtl_parameters.uEnvironment =
                            a[e.environment.environmentMap]),
                          (mtl_parameters.uEnvironmentTransform =
                            e.environment.environmentRotation),
                          (mtl_parameters.sIntegrateBRDF =
                            a[e.environment.integrateBRDFMap]),
                          (mtl_parameters.uSpecularPeak =
                            t.uniforms.uSpecularPeak),
                          (mtl_parameters.uOcclusionHorizon =
                            t.uniforms.uOcclusionHorizon),
                          (mtl_parameters.uEnvironmentExposure =
                            e.environment.environmentExposure),
                          u(mtl_parameters))
                        : "glow" == t.type
                          ? ((mtl_parameters.side = t.side),
                            (mtl_parameters.transparent = t.transparent),
                            (mtl_parameters.cutawayType = t.cutawayType),
                            (mtl_parameters.cutawayThreshold =
                              t.cutawayThreshold),
                            h(mtl_parameters))
                          : "lambert" == t.type
                            ? ((mtl_parameters.side = t.side),
                              (mtl_parameters.transparent = t.transparent),
                              (mtl_parameters.visible = t.visible),
                              (mtl_parameters.color =
                                new THREE.Color().fromArray(t.color)),
                              (mtl_parameters.map = o[t.map]),
                              d(mtl_parameters))
                            : "basic" == t.type
                              ? ((mtl_parameters.side = t.side),
                                (mtl_parameters.transparent = t.transparent),
                                (mtl_parameters.visible = t.visible),
                                p(mtl_parameters))
                              : "cell" == t.type
                                ? ((mtl_parameters.side = t.side),
                                  (mtl_parameters.transparent = t.transparent),
                                  (mtl_parameters.visible = t.visible),
                                  (mtl_parameters.lights = t.lights),
                                  f(mtl_parameters))
                                : void console.error(
                                    "the material type requested does not exist, either select a supported type or add a new type in the source",
                                  )
          );
        }
        function n(e) {
          var t = THREE.pbrShader.pbr,
            n = THREE.UniformsUtils.clone(t.uniforms),
            i = t.vertexShader,
            r = t.fragmentShader;
          ((n.sTextureAlbedoPBR.value = e.baseColorMap),
            (n.sTextureRoughnessPBR.value = e.roughnessMap),
            (n.sTextureNormalMap.value = e.normalMap),
            (n.sTextureMetalnessPBR.value = e.metallicMap),
            (n.sTextureOpacity.value = e.opacityMap),
            (n.sTextureEmitColor.value = e.emitColorMap),
            (n.sSpecularPBR.value = e.sSpecularPBR),
            (n.uEnvironmentExposure.value = e.environmentExposure),
            (n.uDiffuseSPH.value = e.diffuseSPH));
          var a = new THREE.RawShaderMaterial({
            uniforms: n,
            vertexShader: i,
            fragmentShader: r,
            transparent: e.transparent,
            lights: !1,
          });
          return ((a.side = THREE[e.side]), a);
        }
        function i(e) {
          var t = THREE.pbrGlobeCutawayShader.pbr,
            n = THREE.UniformsUtils.clone(t.uniforms),
            i = t.vertexShader,
            r = t.fragmentShader;
          (e.lights &&
            (n = THREE.UniformsUtils.merge([n, THREE.UniformsLib.lights])),
            null != e.uCutawayRadius &&
              (n.uCutawayRadius.value = e.uCutawayRadius),
            null != e.uCutawayThreshold &&
              (n.uCutawayThreshold.value = e.uCutawayThreshold),
            null != e.fogDensity && (n.fogDensity.value = e.fogDensity),
            null != e.fogNear && (n.fogNear.value = e.fogNear),
            null != e.fogFar && (n.fogFar.value = e.fogFar),
            null != e.fogColor &&
              (n.fogColor.value = new THREE.Color().fromArray(e.fogColor)),
            e.uOffsetRepeat &&
              (n.uOffsetRepeat.value = new THREE.Vector4().fromArray(
                e.uOffsetRepeat,
              )),
            null != e.uAlbedoColor &&
              (n.uAlbedoColor.value = new THREE.Color().fromArray(
                e.uAlbedoColor,
              )),
            null != e.uMetalnessFactor &&
              (n.uMetalnessFactor.value = e.uMetalnessFactor),
            null != e.uAOFactor && (n.uAOFactor.value = e.uAOFactor),
            null != e.uFlipY && (n.uFlipY.value = e.uFlipY),
            null != e.uNormalMapFactor &&
              (n.uNormalMapFactor.value = e.uNormalMapFactor),
            null != e.uTextureBumpMapSize &&
              (n.uTextureBumpMapSize.value = e.uTextureBumpMapSize),
            null != e.uBumpMapFactor &&
              (n.uBumpMapFactor.value = e.uBumpMapFactor),
            null != e.uRoughnessFactor &&
              (n.uRoughnessFactor.value = e.uRoughnessFactor),
            null != e.uEmissiveColor &&
              (n.uEmissiveColor.value = new THREE.Color().fromArray(
                e.uEmissiveColor,
              )),
            null != e.uOpacityFactor &&
              (n.uOpacityFactor.value = e.uOpacityFactor),
            null != e.uSpecularF0Factor &&
              (n.uSpecularF0Factor.value = e.uSpecularF0Factor),
            null != e.uAlbedoBlendFactor &&
              (n.uAlbedoBlendFactor.value = e.uAlbedoBlendFactor),
            e.sTextureAlbedo && (n.sTextureAlbedo.value = e.sTextureAlbedo),
            e.sTextureMetalness &&
              (n.sTextureMetalness.value = e.sTextureMetalness),
            e.sTextureAO && (n.sTextureAO.value = e.sTextureAO),
            e.sTextureNormalMap &&
              (n.sTextureNormalMap.value = e.sTextureNormalMap),
            e.sTextureBumpMap && (n.sTextureBumpMap.value = e.sTextureBumpMap),
            e.sTextureRoughness &&
              (n.sTextureRoughness.value = e.sTextureRoughness),
            e.sTextureEmissive &&
              (n.sTextureEmissive.value = e.sTextureEmissive),
            e.sTextureOpacity && (n.sTextureOpacity.value = e.sTextureOpacity),
            e.sTextureSpecularF0 &&
              (n.sTextureSpecularF0.value = e.sTextureSpecularF0),
            e.sTextureAlbedoBlend &&
              (n.sTextureAlbedoBlend.value = e.sTextureAlbedoBlend),
            null != e.uOccludeSpecular &&
              (n.uOccludeSpecular.value = e.uOccludeSpecular),
            null != e.sTexturDisplacement &&
              (n.sTexturDisplacement.value = e.sTexturDisplacement),
            null != e.uDisplacementScale &&
              (n.uDisplacementScale.value = e.uDisplacementScale),
            null != e.uDisplacementBias &&
              (n.uDisplacementBias.value = e.uDisplacementBias),
            null != e.uDiffuseSPH && (n.uDiffuseSPH.value = e.uDiffuseSPH),
            null != e.uEnvironment && (n.uEnvironment.value = e.uEnvironment),
            null != e.uEnvironmentTransform &&
              (n.uEnvironmentTransform.value =
                n.uEnvironmentTransform.value.makeRotationY(
                  THREE.Math.degToRad(e.uEnvironmentTransform),
                )),
            null != e.sIntegrateBRDF &&
              (n.sIntegrateBRDF.value = e.sIntegrateBRDF),
            null != e.uSpecularPeak &&
              (n.uSpecularPeak.value = e.uSpecularPeak),
            null != e.uOcclusionHorizon &&
              (n.uOcclusionHorizon.value = e.uOcclusionHorizon),
            null != e.uEnvironmentExposure &&
              (n.uEnvironmentExposure.value = e.uEnvironmentExposure));
          var a = new THREE.RawShaderMaterial({
            uniforms: n,
            vertexShader: i,
            fragmentShader: r,
            transparent: e.transparent,
            lights: e.lights,
          });
          return (
            (a.extensions.derivatives = !0),
            (a.extensions.shaderTextureLOD = !0),
            (a.side = THREE[e.side]),
            (a.defines.SHADER_TYPE = "pbr-2"),
            e.isDecal && ((a.polygonOffset = !0), (a.polygonOffsetFactor = -1)),
            e.needsTangents && (a.defines.NO_TANGENT = ""),
            (Util.isMobile() || Util.isIOS()) && (a.defines.MOBILE = ""),
            e.cutawayType &&
              "none" === e.cutawayType &&
              (a.defines.NO_CUTAWAY = ""),
            e.cutawayType &&
              "spherical" === e.cutawayType &&
              (a.defines.SPHERICAL_CUTAWAY = ""),
            e.cutawayType &&
              "planer" === e.cutawayType &&
              (a.defines.PLANER_CUTAWAY = ""),
            e.cutawayAxis &&
              "x" === e.cutawayAxis &&
              (a.defines.X_AXIS_CUTAWAY = ""),
            e.cutawayAxis &&
              "y" === e.cutawayAxis &&
              (a.defines.Y_AXIS_CUTAWAY = ""),
            e.cutawayAxis &&
              "z" === e.cutawayAxis &&
              (a.defines.Z_AXIS_CUTAWAY = ""),
            a.uniforms.sTextureAlbedo.value && (a.defines.USE_ALBEDOMAP = ""),
            a.uniforms.sTextureMetalness.value &&
              (a.defines.USE_METALNESSMAP = ""),
            a.uniforms.sTextureAO.value && (a.defines.USE_AOMAP = ""),
            a.uniforms.sTextureNormalMap.value &&
              (a.defines.USE_NORMALMAP = ""),
            a.uniforms.sTextureBumpMap.value && (a.defines.USE_BUMPMAP = ""),
            a.uniforms.sTextureRoughness.value &&
              (a.defines.USE_ROUGHNESSMAP = ""),
            a.uniforms.sTextureEmissive.value &&
              (a.defines.USE_EMISSIVEMAP = ""),
            a.uniforms.sTextureOpacity.value && (a.defines.USE_ALPHAMAP = ""),
            a.uniforms.sTextureSpecularF0.value &&
              (a.defines.USE_SPECULARF0MAP = ""),
            a.uniforms.sTextureAlbedoBlend.value &&
              (a.defines.USE_ALBEDOBLENDMAP = ""),
            a.uniforms.sTexturDisplacement.value &&
              (a.defines.USE_DISPLACEMENTMAP = ""),
            a.uniforms.uEnvironment.value &&
              (a.defines.USE_ENVIRONMENTMAP = ""),
            a.uniforms.sIntegrateBRDF.value &&
              (a.defines.USE_INTEGRATEBRDFMAP = ""),
            a
          );
        }
        function r(e) {
          var t = THREE.pbrTerrainShader["pbr-terrain"],
            n = THREE.UniformsUtils.clone(t.uniforms),
            i = t.vertexShader,
            r = t.fragmentShader;
          ((n.uShadowColor.value = e.shadowColor),
            (n.uMaterialScaleA.value = e.materialScaleA),
            (n.uMaterialScaleB.value = e.materialScaleA),
            (n.sTextureAlbedoA.value = e.baseColorMapA),
            (n.sTextureAlbedoB.value = e.baseColorMapB),
            (n.sTextureNormalMapA.value = e.normalMapA),
            (n.sTextureNormalMapB.value = e.normalMapB),
            (n.sTextureRoughness.value = e.roughnessMap),
            (n.sTextureBaseNormalMap.value = e.baseNormalMap),
            (n.sTextureLightMap.value = e.lightMap),
            (n.sTextureMetalness.value = e.metallicMap),
            (n.sTextureSplatMap.value = e.splatMap),
            (n.sTextureEmissive.value = e.emitColorMap),
            (n.uEnvironment.value = e.sSpecularPBR),
            (n.sIntegrateBRDF.value = e.sIntegrateBRDF),
            (n.uEnvironmentExposure.value = e.environmentExposure),
            (n.uDiffuseSPH.value = e.diffuseSPH));
          var a = new THREE.RawShaderMaterial({
            uniforms: n,
            vertexShader: i,
            fragmentShader: r,
            transparent: e.transparent,
            lights: !1,
          });
          return (
            (a.extensions.derivatives = !0),
            (a.extensions.shaderTextureLOD = !0),
            (a.side = THREE[e.side]),
            (Util.isMobile() || Util.isIOS()) && (a.defines.MOBILE = ""),
            a.uniforms.sTextureAlbedoA.value && (a.defines.USE_ALBEDOMAPA = ""),
            a.uniforms.sTextureAlbedoB.value && (a.defines.USE_ALBEDOMAPB = ""),
            a.uniforms.sTextureNormalMapA.value &&
              (a.defines.USE_NORMALMAPA = ""),
            a.uniforms.sTextureNormalMapB.value &&
              (a.defines.USE_NORMALMAPB = ""),
            a.uniforms.sTextureMetalness.value &&
              (a.defines.USE_METALNESSMAP = ""),
            a.uniforms.sTextureLightMap.value && (a.defines.USE_LIGHTMAP = ""),
            a.uniforms.sTextureBaseNormalMap.value &&
              (a.defines.USE_BASENORMALMAP = ""),
            a.uniforms.sTextureRoughness.value &&
              (a.defines.USE_ROUGHNESSMAP = ""),
            a.uniforms.sTextureEmissive.value &&
              (a.defines.USE_EMISSIVEMAP = ""),
            a.uniforms.sTextureSplatMap.value && (a.defines.USE_SPLATMAP = ""),
            a.uniforms.uEnvironment.value &&
              (a.defines.USE_ENVIRONMENTMAP = ""),
            a.uniforms.sIntegrateBRDF.value &&
              (a.defines.USE_INTEGRATEBRDFMAP = ""),
            a
          );
        }
        function l(e) {
          var t = THREE.pbrTerrain2Shader["pbr-terrain-2"],
            n = THREE.UniformsUtils.clone(t.uniforms),
            i = t.vertexShader,
            r = t.fragmentShader;
          (e.fogDensity && (n.fogDensity.value = e.fogDensity),
            e.fogNear && (n.fogNear.value = e.fogNear),
            e.fogFar && (n.fogFar.value = e.fogFar),
            e.fogColor &&
              (n.fogColor.value = new THREE.Color().fromArray(e.fogColor)),
            e.uOffsetRepeat &&
              (n.uOffsetRepeat.value = new THREE.Vector4().fromArray(
                e.uOffsetRepeat,
              )),
            e.uAlbedoColor &&
              (n.uAlbedoColor.value = new THREE.Color().fromArray(
                e.uAlbedoColor,
              )),
            e.uMetalnessFactor &&
              (n.uMetalnessFactor.value = e.uMetalnessFactor),
            e.uAOFactor && (n.uAOFactor.value = e.uAOFactor),
            e.uFlipY && (n.uFlipY.value = e.uFlipY),
            e.uNormalMapFactor &&
              (n.uNormalMapFactor.value = e.uNormalMapFactor),
            e.uTextureBumpMapSize &&
              (n.uTextureBumpMapSize.value = e.uTextureBumpMapSize),
            e.uBumpMapFactor && (n.uBumpMapFactor.value = e.uBumpMapFactor),
            e.uRoughnessFactor &&
              (n.uRoughnessFactor.value = e.uRoughnessFactor),
            e.uEmissiveColor &&
              (n.uEmissiveColor.value = new THREE.Color().fromArray(
                e.uEmissiveColor,
              )),
            e.uOpacityFactor && (n.uOpacityFactor.value = e.uOpacityFactor),
            e.uSpecularF0Factor &&
              (n.uSpecularF0Factor.value = e.uSpecularF0Factor),
            e.sTextureAlbedo && (n.sTextureAlbedo.value = e.sTextureAlbedo),
            e.sTextureMetalness &&
              (n.sTextureMetalness.value = e.sTextureMetalness),
            e.sTextureAO && (n.sTextureAO.value = e.sTextureAO),
            e.sTextureNormalMap &&
              (n.sTextureNormalMap.value = e.sTextureNormalMap),
            e.sTextureBumpMap && (n.sTextureBumpMap.value = e.sTextureBumpMap),
            e.sTextureRoughness &&
              (n.sTextureRoughness.value = e.sTextureRoughness),
            e.sTextureEmissive &&
              (n.sTextureEmissive.value = e.sTextureEmissive),
            e.sTextureOpacity && (n.sTextureOpacity.value = e.sTextureOpacity),
            e.sTextureSpecularF0 &&
              (n.sTextureSpecularF0.value = e.sTextureSpecularF0),
            e.uOccludeSpecular &&
              (n.uOccludeSpecular.value = e.uOccludeSpecular),
            e.sTexturDisplacement &&
              (n.sTexturDisplacement.value = e.sTexturDisplacement),
            e.uDisplacementScale &&
              (n.uDisplacementScale.value = e.uDisplacementScale),
            e.uDisplacementBias &&
              (n.uDisplacementBias.value = e.uDisplacementBias),
            e.uDiffuseSPH && (n.uDiffuseSPH.value = e.uDiffuseSPH),
            e.uEnvironment && (n.uEnvironment.value = e.uEnvironment),
            e.sIntegrateBRDF && (n.sIntegrateBRDF.value = e.sIntegrateBRDF),
            e.uSpecularPeak && (n.uSpecularPeak.value = e.uSpecularPeak),
            e.uOcclusionHorizon &&
              (n.uOcclusionHorizon.value = e.uOcclusionHorizon),
            e.uEnvironmentExposure &&
              (n.uEnvironmentExposure.value = e.uEnvironmentExposure));
          var a = new THREE.RawShaderMaterial({
            uniforms: n,
            vertexShader: i,
            fragmentShader: r,
            transparent: e.transparent,
            lights: !1,
          });
          return (
            (a.extensions.derivatives = !0),
            (a.extensions.shaderTextureLOD = !0),
            (a.side = THREE[e.side]),
            e.needsTangents && (a.defines.NO_TANGENT = ""),
            (Util.isMobile() || Util.isIOS()) && (a.defines.MOBILE = ""),
            a.uniforms.sTextureAlbedo.value && (a.defines.USE_ALBEDOMAP = ""),
            a.uniforms.sTextureMetalness.value &&
              (a.defines.USE_METALNESSMAP = ""),
            a.uniforms.sTextureAO.value && (a.defines.USE_AOMAP = ""),
            a.uniforms.sTextureNormalMap.value &&
              (a.defines.USE_NORMALMAP = ""),
            a.uniforms.sTextureBumpMap.value && (a.defines.USE_BUMPMAP = ""),
            a.uniforms.sTextureRoughness.value &&
              (a.defines.USE_ROUGHNESSMAP = ""),
            a.uniforms.sTextureEmissive.value &&
              (a.defines.USE_EMISSIVEMAP = ""),
            a.uniforms.sTextureOpacity.value && (a.defines.USE_ALPHAMAP = ""),
            a.uniforms.sTextureSpecularF0.value &&
              (a.defines.USE_SPECULARF0MAP = ""),
            a.uniforms.sTexturDisplacement.value &&
              (a.defines.USE_DISPLACEMENTMAP = ""),
            a.uniforms.uEnvironment.value &&
              (a.defines.USE_ENVIRONMENTMAP = ""),
            a.uniforms.sIntegrateBRDF.value &&
              (a.defines.USE_INTEGRATEBRDFMAP = ""),
            a
          );
        }
        function c(e) {
          var t = THREE.pbrPlantShader["pbr-plant"],
            n = THREE.UniformsUtils.clone(t.uniforms),
            i = t.vertexShader,
            r = t.fragmentShader;
          ((n = THREE.UniformsUtils.merge([n, THREE.UniformsLib.lights])),
            e.shadowColor &&
              (n.uShadowColor.value = new THREE.Color().fromArray(
                e.shadowColor,
              )),
            e.baseColorMap && (n.sTextureAlbedo.value = e.baseColorMap),
            e.environmentExposure &&
              (n.uEnvironmentExposure.value = e.environmentExposure),
            e.diffuseSPH && (n.uDiffuseSPH.value = e.diffuseSPH));
          var a = new THREE.RawShaderMaterial({
            uniforms: n,
            vertexShader: i,
            fragmentShader: r,
            transparent: e.transparent,
            lights: !0,
          });
          return (
            (a.extensions.derivatives = !0),
            (a.extensions.shaderTextureLOD = !0),
            (a.side = THREE[e.side]),
            a.uniforms.sTextureAlbedo.value && (a.defines.USE_ALBEDOMAP = ""),
            a
          );
        }
        function u(e) {
          var t = THREE.pbr2Shader["pbr-2"],
            n = THREE.UniformsUtils.clone(t.uniforms),
            i = t.vertexShader,
            r = t.fragmentShader;
          (e.fogDensity && (n.fogDensity.value = e.fogDensity),
            e.fogNear && (n.fogNear.value = e.fogNear),
            e.fogFar && (n.fogFar.value = e.fogFar),
            e.fogColor &&
              (n.fogColor.value = new THREE.Color().fromArray(e.fogColor)),
            e.uOffsetRepeat &&
              (n.uOffsetRepeat.value = new THREE.Vector4().fromArray(
                e.uOffsetRepeat,
              )),
            e.uAlbedoColor &&
              (n.uAlbedoColor.value = new THREE.Color().fromArray(
                e.uAlbedoColor,
              )),
            e.uMetalnessFactor &&
              (n.uMetalnessFactor.value = e.uMetalnessFactor),
            e.uAOFactor && (n.uAOFactor.value = e.uAOFactor),
            e.uFlipY && (n.uFlipY.value = e.uFlipY),
            e.uNormalMapFactor &&
              (n.uNormalMapFactor.value = e.uNormalMapFactor),
            e.uTextureBumpMapSize &&
              (n.uTextureBumpMapSize.value = e.uTextureBumpMapSize),
            e.uBumpMapFactor && (n.uBumpMapFactor.value = e.uBumpMapFactor),
            e.uRoughnessFactor &&
              (n.uRoughnessFactor.value = e.uRoughnessFactor),
            e.uEmissiveColor &&
              (n.uEmissiveColor.value = new THREE.Color().fromArray(
                e.uEmissiveColor,
              )),
            e.uOpacityFactor && (n.uOpacityFactor.value = e.uOpacityFactor),
            e.uSpecularF0Factor &&
              (n.uSpecularF0Factor.value = e.uSpecularF0Factor),
            e.sTextureAlbedo && (n.sTextureAlbedo.value = e.sTextureAlbedo),
            e.sTextureMetalness &&
              (n.sTextureMetalness.value = e.sTextureMetalness),
            e.sTextureAO && (n.sTextureAO.value = e.sTextureAO),
            e.sTextureNormalMap &&
              (n.sTextureNormalMap.value = e.sTextureNormalMap),
            e.sTextureBumpMap && (n.sTextureBumpMap.value = e.sTextureBumpMap),
            e.sTextureRoughness &&
              (n.sTextureRoughness.value = e.sTextureRoughness),
            e.sTextureEmissive &&
              (n.sTextureEmissive.value = e.sTextureEmissive),
            e.sTextureOpacity && (n.sTextureOpacity.value = e.sTextureOpacity),
            e.sTextureSpecularF0 &&
              (n.sTextureSpecularF0.value = e.sTextureSpecularF0),
            e.uOccludeSpecular &&
              (n.uOccludeSpecular.value = e.uOccludeSpecular),
            e.sTexturDisplacement &&
              (n.sTexturDisplacement.value = e.sTexturDisplacement),
            e.uDisplacementScale &&
              (n.uDisplacementScale.value = e.uDisplacementScale),
            e.uDisplacementBias &&
              (n.uDisplacementBias.value = e.uDisplacementBias),
            e.uDiffuseSPH && (n.uDiffuseSPH.value = e.uDiffuseSPH),
            e.uEnvironment && (n.uEnvironment.value = e.uEnvironment),
            e.uEnvironmentTransform &&
              (n.uEnvironmentTransform.value =
                n.uEnvironmentTransform.value.makeRotationY(
                  THREE.Math.degToRad(e.uEnvironmentTransform),
                )),
            e.sIntegrateBRDF && (n.sIntegrateBRDF.value = e.sIntegrateBRDF),
            e.uSpecularPeak && (n.uSpecularPeak.value = e.uSpecularPeak),
            e.uOcclusionHorizon &&
              (n.uOcclusionHorizon.value = e.uOcclusionHorizon),
            e.uEnvironmentExposure &&
              (n.uEnvironmentExposure.value = e.uEnvironmentExposure));
          var a = new THREE.RawShaderMaterial({
            uniforms: n,
            vertexShader: i,
            fragmentShader: r,
            transparent: e.transparent,
            lights: !1,
          });
          return (
            (a.extensions.derivatives = !0),
            (a.extensions.shaderTextureLOD = !0),
            (a.side = THREE[e.side]),
            (a.defines.SHADER_TYPE = "pbr-2"),
            e.isDecal && ((a.polygonOffset = !0), (a.polygonOffsetFactor = -1)),
            e.needsTangents && (a.defines.NO_TANGENT = ""),
            (Util.isMobile() || Util.isIOS()) && (a.defines.MOBILE = ""),
            (a.defines.USE_COLOR = ""),
            a.uniforms.sTextureAlbedo.value && (a.defines.USE_ALBEDOMAP = ""),
            a.uniforms.sTextureMetalness.value &&
              (a.defines.USE_METALNESSMAP = ""),
            a.uniforms.sTextureAO.value && (a.defines.USE_AOMAP = ""),
            a.uniforms.sTextureNormalMap.value &&
              (a.defines.USE_NORMALMAP = ""),
            a.uniforms.sTextureBumpMap.value && (a.defines.USE_BUMPMAP = ""),
            a.uniforms.sTextureRoughness.value &&
              (a.defines.USE_ROUGHNESSMAP = ""),
            a.uniforms.sTextureEmissive.value &&
              (a.defines.USE_EMISSIVEMAP = ""),
            a.uniforms.sTextureOpacity.value && (a.defines.USE_ALPHAMAP = ""),
            a.uniforms.sTextureSpecularF0.value &&
              (a.defines.USE_SPECULARF0MAP = ""),
            a.uniforms.sTexturDisplacement.value &&
              (a.defines.USE_DISPLACEMENTMAP = ""),
            a.uniforms.uEnvironment.value &&
              (a.defines.USE_ENVIRONMENTMAP = ""),
            a.uniforms.sIntegrateBRDF.value &&
              (a.defines.USE_INTEGRATEBRDFMAP = ""),
            a
          );
        }
        function h(e) {
          var t = THREE.glowShader.glow,
            n = THREE.UniformsUtils.clone(t.uniforms),
            i = t.vertexShader,
            r = t.fragmentShader;
          ((n.uCutawayType.value = e.cutawayType),
            (n.uCutawayThreshold.value = e.cutawayThreshold));
          var a = new THREE.RawShaderMaterial({
            uniforms: n,
            vertexShader: i,
            fragmentShader: r,
            transparent: e.transparent,
            blending: THREE.AdditiveBlending,
            lights: !1,
          });
          return ((a.side = THREE[e.side]), a);
        }
        function d(e) {
          var t = new THREE.MeshLambertMaterial({
            transparent: e.transparent,
            visible: e.visible,
            color: e.color,
          });
          return (e.map && (t.map = e.map), (t.side = THREE[e.side]), t);
        }
        function p(e) {
          var t = new THREE.MeshBasicMaterial({
            transparent: e.transparent,
            visible: e.visible,
          });
          return ((t.side = THREE[e.side]), t);
        }
        function f(e) {
          ((SHADE.vertexShadersPath = "../../shade.js-master/vertex-shaders"),
            (SHADE.fragmentShadersPath =
              "../../shade.js-master/fragment-shaders"));
          var t = new SHADE.MeshCellMaterial({
            transparent: e.transparent,
            visible: e.visible,
            lights: e.lights,
          });
          return ((t.side = THREE[e.side]), t);
        }
        function m(e) {
          var t = e.slice(0, 27),
            n = 1 / (2 * Math.sqrt(Math.PI)),
            i = -0.5 * Math.sqrt(3 / Math.PI),
            r = -i,
            a = i,
            o = 0.5 * Math.sqrt(15 / Math.PI),
            s = -o,
            l = 0.25 * Math.sqrt(5 / Math.PI),
            c = s,
            u = 0.25 * Math.sqrt(15 / Math.PI);
          return (t = [
            n,
            n,
            n,
            i,
            i,
            i,
            r,
            r,
            r,
            a,
            a,
            a,
            o,
            o,
            o,
            s,
            s,
            s,
            l,
            l,
            l,
            c,
            c,
            c,
            u,
            u,
            u,
          ].map(
            function (e, n) {
              return e * t[n];
            }.bind(this),
          ));
        }
        for (var v = 0; v < e.materials.length; v++) {
          var g = e.materials[v];
          s[g.name] = t(g);
        }
      },
      f = function (n, i) {
        function a() {
          ($(".webgl_outer_container .loading_webgl").css("opacity", 0),
            $(".webgl_outer_container .loading_webgl").css(
              "visibility",
              "hidden",
            ));
        }
        function o(e, t, n, i) {
          l[n.name] = f(e, t, n, i);
        }
        function u(e, t, n) {
          l[t.name] = m(e, t, n);
        }
        function h(e, t, n) {
          l[t.name] = v(e, t, n);
        }
        function d(e, t, n) {
          l[t.name] = g(e, t, n);
        }
        function p(e, t, n) {
          l[t.name] = y(e, t, n);
        }
        function f(e, t, n, i) {
          return b(e, t, n, i);
        }
        function m(e, t, n) {
          if (t.parameters) {
            var i = {};
            (t.parameters.radius && (i.radius = t.parameters.radius),
              t.parameters.widthSegments &&
                (i.widthSegments = t.parameters.widthSegments),
              t.parameters.heightSegments &&
                (i.heightSegments = t.parameters.heightSegments),
              t.parameters.flavor && (i.flavor = t.parameters.flavor),
              t.parameters.phiStart &&
                (i.phiStart = THREE.Math.degToRad(t.parameters.phiStart)),
              t.parameters.phiLength &&
                (i.phiLength = THREE.Math.degToRad(t.parameters.phiLength)),
              t.parameters.thetaStart &&
                (i.thetaStart = THREE.Math.degToRad(t.parameters.thetaStart)),
              t.parameters.thetaLength &&
                (i.thetaLength = THREE.Math.degToRad(t.parameters.thetaLength)),
              t.parameters.thickness && (i.thickness = t.parameters.thickness),
              !0 === t.parameters.cutaway &&
                3 !== t.materials.length &&
                console.error(
                  "if shellGeometry parameter, 'cutaway' is set to true, 3 materials of type 'pbr-cut' must be ready from the json",
                ),
              t.parameters.cutaway && (i.cutaway = t.parameters.cutaway));
          }
          return b(e, new THREE.ShellGeometry(i), t, n);
        }
        function v(e, t, n) {
          if (t.parameters) {
            var i = {};
            (t.parameters.radius && (i.radius = t.parameters.radius),
              t.parameters.widthSegments &&
                (i.widthSegments = t.parameters.widthSegments),
              t.parameters.heightSegments &&
                (i.heightSegments = t.parameters.heightSegments),
              t.parameters.flavor && (i.flavor = t.parameters.flavor),
              t.parameters.phiStart &&
                (i.phiStart = THREE.Math.degToRad(t.parameters.phiStart)),
              t.parameters.phiLength &&
                (i.phiLength = THREE.Math.degToRad(t.parameters.phiLength)),
              t.parameters.thetaStart &&
                (i.thetaStart = THREE.Math.degToRad(t.parameters.thetaStart)),
              t.parameters.thetaLength &&
                (i.thetaLength = THREE.Math.degToRad(t.parameters.thetaLength)),
              t.parameters.thickness && (i.thickness = t.parameters.thickness),
              !0 === t.parameters.cutaway &&
                3 !== t.materials.length &&
                console.error(
                  "if shellGeometry parameter, 'cutaway' is set to true, 3 materials of type 'pbr-cut' must be ready from the json",
                ),
              t.parameters.cutaway && (i.cutaway = t.parameters.cutaway));
          }
          return b(e, new THREE.ShellGeometry(i), t, n);
        }
        function g(e, t, n) {
          return w(new THREE.Globe(), e, t, n);
        }
        function y(e, t, n) {
          return w(new THREE.Group(), e, t, n);
        }
        function b(e, t, n, i) {
          for (var r = [], a = 0; a < n.materials.length; a++)
            (r.push(s[n.materials[a]]),
              "shell" === n.type &&
                (r[a].uniforms.uCutawayThreshold.value =
                  n.parameters.radius + 0.05 * n.parameters.radius));
          if (n.computeTangents) {
            (E(buffGeo), THREE.BufferGeometryUtils.computeTangents(buffGeo));
            var o = new THREE.Mesh(t, r);
          } else o = new THREE.Mesh(t, r);
          return w(o, e, n, i);
        }
        function w(e, t, n, i) {
          if (e.material)
            for (var r = e.material, a = 0; a < r.length; a++)
              !0 === r[a].transparent && (e.renderOrder = 1);
          ((e.name = n.name), (e.partNames = n.partNames));
          var o = new THREE.Vector3().fromArray(n.position);
          if (n.childDepth > 0) {
            var s = M(t, n),
              l = o.sub(s);
            e.position.copy(l);
          } else e.position.copy(o);
          var u = new THREE.Vector3().fromArray(n.scale);
          return (
            e.scale.copy(u),
            null != i && (e.idx = i),
            !0 === n.intersectable && c.push(e),
            e
          );
        }
        function M(e, t) {
          function n(e, t) {
            e.name === r && (i = t);
          }
          var i,
            r = t.parentName,
            a = new THREE.Vector3();
          if ((_.find(e.meshes, n), void 0 === i)) return a;
          for (var o = 0; o < t.childDepth; o++) {
            var s = new THREE.Vector3().fromArray(e.meshes[i].position);
            (a.add(s), (r = e.meshes[i].name), _.find(e.meshes, n));
          }
          return a;
        }
        function E(e) {
          for (
            var t =
                e.attributes.position.array.length /
                e.attributes.position.itemSize,
              n = new Uint32Array(t),
              i = 0;
            i < n.length;
            i++
          )
            n[i] = i;
          e.setIndex(new THREE.BufferAttribute(n, 1));
        }
        for (var x = n.meshes, T = !0, S = 0; S < x.length; S++)
          "binMesh" === x[S].type && (T = !1);
        if (0 === x.length)
          ($(".load_bar").css("width", "100%"),
            (e = !0),
            (t.loaded = !0),
            a(),
            "function" == typeof i && i());
        else if (T)
          (!(function () {
            for (var e = 0; e < x.length; e++)
              x[(t = e)].type &&
                ("globe" === x[t].type
                  ? d(n, x[t], t)
                  : "shellGroup" === x[t].type
                    ? p(n, x[t], t)
                    : "collision" === x[t].type
                      ? h(n, x[t], t)
                      : "shell" === x[t].type && u(n, x[t], t));
            var t;
          })(),
            $(".load_bar").css("width", "100%"),
            (e = !0),
            (t.loaded = !0),
            a(),
            "function" == typeof i && i());
        else {
          var k = new THREE.LoadingManager();
          k.onProgress = function (n, r, o) {
            ($(".load_bar").css("width", (r / o) * 100 + "%"),
              r === o &&
                ((e = !0),
                (t.loaded = !0),
                console.log("geometry loaded"),
                a(),
                "function" == typeof i && i()));
          };
          var C = new THREE.BinaryLoader(k);
          !(function () {
            for (var e = 0; e < x.length; e++)
              !(function (e) {
                x[e].type &&
                  ("binMesh" === x[e].type
                    ? C.load(
                        r + x[e].url,
                        function (t) {
                          o(n, t, x[e], e);
                        },
                        function () {},
                        function () {
                          console.error(
                            "An error occured in loading geometry from " +
                              r +
                              x[e].url,
                          );
                        },
                      )
                    : "globe" === x[e].type
                      ? d(n, x[e], e)
                      : "shellGroup" === x[e].type
                        ? p(n, x[e], e)
                        : "collision" === x[e].type
                          ? h(n, x[e], e)
                          : "shell" === x[e].type && u(n, x[e], e));
              })(e);
          })();
        }
      },
      m = function (e) {
        return arguments.length ? o[e] : o;
      },
      v = function (e) {
        return arguments.length ? s[e] : s;
      },
      g = function (e) {
        return arguments.length ? l[e] : l;
      },
      y = function (t) {
        if (!arguments.length) return e;
        e = t;
      },
      b = function (e) {
        if (!arguments.length) return t;
        t = e;
      },
      w = function (e) {
        if (!arguments.length) return i;
        i = e;
      },
      M = function (e) {
        if (!arguments.length) return n;
        n = e;
      },
      E = function (e) {
        if (!arguments.length) return r;
        r = e;
      },
      x = function (e) {
        if (!arguments.length) return c;
        c = e;
      },
      T = function (e) {
        var n;
        return "number" == typeof e
          ? ((n = t.components[e].image), m(n))
          : "string" == typeof e
            ? ((n = _.chain(t.components)
                .find(function (t) {
                  return e === t.name;
                })
                .value()),
              m(n.image))
            : (console.error(
                "Mb3D.GlobeModel.component.getTextureByComponentName: index is not of type number or string",
                e,
              ),
              this);
      };
    return {
      loaded: y,
      loadData: function (e, n) {
        var i = new XMLHttpRequest();
        (i.open("GET", e, !0),
          (i.onload = function () {
            i.status >= 200 && i.status < 400
              ? ((t = JSON.parse(i.responseText)), n())
              : console.error(
                  "MetaLoader: Couldn't load [" + e + "] [" + i.status + "]",
                );
          }),
          (i.onerror = function () {}),
          i.send());
      },
      loadComponents: u,
      loadTextures: d,
      loadDataTextures: h,
      loadMaterials: p,
      loadGeometry: f,
      createHierarchy: function () {
        for (var e = t.meshes, n = e.length, i = 0; i < n; i++)
          e[i].childDepth > 0 &&
            l[e[i].parentName] &&
            l[e[i].name] &&
            l[e[i].parentName].add(l[e[i].name]);
      },
      getRootParents: function () {
        var e = [];
        for (var t in l)
          l.hasOwnProperty(t) && null === l[t].parent && e.push(l[t]);
        return e;
      },
      getDataTexture: function () {
        return a;
      },
      getTexture: m,
      getMaterial: v,
      getMesh: g,
      getParts: function (e) {
        return _.chain(t.components)
          .filter(function (t) {
            return _.contains(e, t.name);
          })
          .map(function (e) {
            return e.meshes;
          })
          .flatten()
          .unique()
          .map(function (e) {
            return l[e];
          })
          .filter(function (e) {
            return null === l[e.name].parent;
          })
          .value();
      },
      data: b,
      dataTexturePath: w,
      texturePath: M,
      geometryPath: E,
      intersectable: x,
      component: {
        getName: function (e) {
          return t.components[e].name;
        },
        getLabel: function (e) {
          return t.components[e].label;
        },
        getDescription: function (e) {
          return t.components[e].description;
        },
        getOverlayURL: function (e) {
          return t.components[e].overlayURL;
        },
        getOverlayImageURL: function (e) {
          return "number" == typeof e
            ? t.components[e].overlayImageURL
            : "string" == typeof e
              ? _.chain(t.components)
                  .find(function (t) {
                    return e === t.name;
                  })
                  .value().overlayImageURL
              : (console.error(
                  "Mb3D.GlobeModel.component.getCameraPosition: index is not of type number or string",
                  e,
                ),
                this);
        },
        getFirstMesh: function (e) {
          var n = t.components[e].meshes[0];
          return l[n];
        },
        getCameraPosition: function (e) {
          var n = t.components[e].camera;
          return new THREE.Vector3().fromArray(n);
        },
        getOverlayCameraPosition: function (e) {
          var n;
          return "number" == typeof e
            ? ((n = t.components[e].content.camera),
              new THREE.Vector3().fromArray(n))
            : "string" == typeof e
              ? ((n = _.chain(t.components)
                  .find(function (t) {
                    return e === t.name;
                  })
                  .value()),
                new THREE.Vector3().fromArray(n.content.camera))
              : (console.error(
                  "Mb3D.GlobeModel.component.getCameraPosition: index is not of type number or string",
                  e,
                ),
                this);
        },
        getTextureByComponentName: T,
        getHotspotsByComponentName: function (e) {
          return "number" == typeof e
            ? t.components[e].spot
            : "string" == typeof e
              ? _.chain(t.components)
                  .find(function (t) {
                    return e === t.name;
                  })
                  .value().spot
              : (console.error(
                  "Mb3D.GlobeModel.component.getHotspotsByComponentName: index is not of type number or string",
                  e,
                ),
                this);
        },
        getHotspots: function (e) {
          return t.components[e].spot;
        },
        getHotspotRadius: function (e) {
          return t.components[e].spotRadius;
        },
      },
    };
  })()));
var globeViewer = {
  data: null,
  container: null,
  width: null,
  height: null,
  renderer: null,
  composer: null,
  fxaaPass: null,
  unrealBloomPass: null,
  camera: null,
  controls: null,
  // FOV comparable to a telescope; distance chosen so image fills the canvas.
  cameraFOV: 1,
  cameraMaxDistance: 200.2,
  picker: null,
  scene: null,
  directionalLight: null,
  stats: null,
  statsEnabled: false,
  navIsOpen: true,
  navIsAnimating: false,
  globe: null,
  surface: null,
  surfaceAlbedo: null,
  rotatesOnAxis: !1,
  isRotatingOnAxis: !0,
  hasHotspots: !1,
  intersectableObjects: [],
  slid: 0,
  slideSpeed: 0.75,
  showingBlend: !1,
  directionalLightIsOn: !0,
  environmentLightIsOn: !1,
  fullyInBLoom: null,
  targetAspectRatio: 1,
  animation: { shiftPhase: null, spinGlobe: null },
  loop: null,
  init: function (e, t) {
    ((this.data = e || {}),
      (this.hasHotspots = void 0 !== t && t),
      (this.hotspotOffset =
        void 0 !== globeViewer.data.hotspotOffset
          ? globeViewer.data.hotspotOffset
          : 0),
      (this.environmentExposure =
        void 0 !== globeViewer.data.globe.environment.environmentExposure
          ? globeViewer.data.globe.environment.environmentExposure
          : 1),
      (this.spinsOnLoad =
        void 0 === globeViewer.data.spinsOnLoad ||
        globeViewer.data.spinsOnLoad),
      (this.container = document.getElementById("webgl_container")),
      (this.outerContainer = document.getElementsByClassName(
        "webgl_outer_container",
      )[0]),
      (this.width = this.outerContainer.clientWidth),
      (this.height = this.outerContainer.clientHeight));
    var n = globeViewer.aspectSize(this.width, this.height),
      i = n.width >= this.width ? 0 : (this.width - n.width) / 2,
      r = n.height >= this.height ? 0 : (this.height - n.height) / 2;
    ((this.container.style.width = n.width + "px"),
      (this.container.style.height = n.height + "px"),
      (this.container.style.marginLeft = i + "px"),
      (this.container.style.marginTop = r + "px"),
      (this.renderer = new THREE.WebGLRenderer({
        antialias: !1,
        alpha: !0,
        precision: "highp",
		toneMapping: THREE.LinearToneMapping,
		toneMappingExposure: 0
      })),
      this.renderer.setPixelRatio(
        Math.max(1, Math.floor(window.devicePixelRatio)),
      ),
      this.renderer.setSize(n.width, n.height),
      this.renderer.setFaceCulling(THREE.CullFaceNone),
      (this.renderer.sortObjects = !0),
      this.renderer.setClearColor(16711680, 0),
      this.container.appendChild(this.renderer.domElement),
      (this.canvas = this.renderer.context.canvas),
      Mb3D.CameraRig.init({
        aspect: this.targetAspectRatio,
        domElement: this.outerContainer,
        initPosition: new THREE.Vector3(this.cameraMaxDistance, 0, 0),
        minDistance: this.cameraMaxDistance,
        maxDistance: this.cameraMaxDistance,
		fov: this.cameraFOV,
        backOutDistance: 10
      }),
      (Mb3D.CameraRig.controls().enableZoom = !1),
      (Mb3D.CameraRig.controls().enablePan = !1),
      (this.scene = new THREE.Scene()),
      (this.sunLight = new THREE.DirectionalLight(0xffffff, 1)),
      this.sunLight.position.set(0, 0, 1),
      this.scene.add(this.sunLight),
	  
	  (this.earthLight = new THREE.DirectionalLight(0xffffff, 0.05)),
      this.earthLight.position.set(1, 0, 0),
      this.scene.add(this.earthLight),
	  
	  this.setSubEarth(0,0),
	  this.setSubSun(0,-90),
	  
      (this.composer = new THREE.EffectComposer(globeViewer.renderer)),
      this.composer.setSize(this.canvas.width, this.canvas.height),
      this.composer.addPass(
        new THREE.RenderPass(this.scene, Mb3D.CameraRig.camera()),
      ),
      (this.fxaaPass = new THREE.ShaderPass(THREE.FXAAShader)),
      this.fxaaPass.uniforms.resolution.value.set(
        1 / this.canvas.width,
        1 / this.canvas.height,
      ),
      //this.composer.addPass(this.fxaaPass),
      (this.unrealBloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(this.canvas.width, this.canvas.height),
        3.5,
        1,
        1,
      ))/*,
      this.composer.addPass(this.unrealBloomPass)*/);
    var a = new THREE.ShaderPass(THREE.CopyShader);
    return (
      (a.renderToScreen = !0),
      this.composer.addPass(a),
      globeViewer.initListeners(),
      this.statsEnabled && globeViewer.initStats(),
      globeViewer.createGlobe()
    );
  },
  fallback: function (e) {
    ((this.data = e || {}),
      (this.container = document.getElementById("webgl_container")));
    document.getElementById("page");
    ((this.container.style.backgroundImage =
      "url('" + globeViewer.data.fallbackImageURL + "')"),
      (this.container.style.backgroundPosition = "center"),
      (this.container.style.backgroundSize = "cover"));
  },
  initStats: function () {
    ((globeViewer.stats = new Stats()),
      (globeViewer.stats.domElement.style.position = "absolute"),
      (globeViewer.stats.domElement.style.top = "0px"),
      (globeViewer.stats.domElement.style.left = ""),
      (globeViewer.stats.domElement.style.right = "0px"),
      (globeViewer.stats.domElement.style.zIndex = 100),
      globeViewer.container.appendChild(globeViewer.stats.domElement));
  },
  initListeners: function () {
    window.addEventListener("resize", globeViewer.onWindowResize, !1);
  },
  aspectSize: function (e, t) {
    var n = globeViewer.targetAspectRatio;
    return e / t > n
      ? { width: t * n, height: t }
      : { width: e, height: e / n };
  },
  onWindowResize: function (e) {
    var t = Math.max(globeViewer.outerContainer.clientWidth, 1024),
      n = Math.max(globeViewer.outerContainer.clientHeight, 1024),
      i = globeViewer.renderer.context.canvas,
      r = globeViewer.aspectSize(t, n),
      a = r.width >= t ? 0 : (t - r.width) / 2,
      o = r.height >= n ? 0 : (n - r.height) / 2;
    (Mb3D.CameraRig.refreshAspect(globeViewer.targetAspectRatio),
      globeViewer.renderer.setSize(r.width, r.height),
      globeViewer.composer.setSize(i.width, i.height),
      globeViewer.fxaaPass.uniforms.resolution.value.set(
        1 / i.width,
        1 / i.height,
      ),
      (globeViewer.container.style.width = r.width + "px"),
      (globeViewer.container.style.height = r.height + "px"),
      (globeViewer.container.style.marginLeft = a + "px"),
      (globeViewer.container.style.marginTop = o + "px"),
      globeViewer.hasHotspots &&
        globeViewer.globe.hotspotCluster.setHotspotContainerSize(
          r.width,
          r.height,
        ),
      "function" == typeof e && e.call());
  },
  createGlobe: function () {
    return new Promise(function (e) {
      (Mb3D.GlobeModel.data(globeViewer.data.globe),
        Mb3D.GlobeModel.texturePath(globeViewer.data.globe.options.texturePath),
        Mb3D.GlobeModel.dataTexturePath(
          globeViewer.data.globe.options.dataTexturePath,
        ),
        Mb3D.GlobeModel.geometryPath(
          globeViewer.data.globe.options.geometryPath,
        ),
        Mb3D.GlobeModel.intersectable(globeViewer.intersectableObjects),
        Mb3D.GlobeModel.loadComponents(function () {
          (Mb3D.GlobeModel.createHierarchy(),
            (globeViewer.globe = Mb3D.GlobeModel.getMesh("globe")));
          var t = globeViewer.angularVelocity < 0 ? 1 : -1;
          ((globeViewer.globe.rotation.y = 0), //t*Math.PI*.5,
            (globeViewer.surface =
              Mb3D.GlobeModel.getMesh("anorthositic_crust")),
            (globeViewer.surfaceAlbedo =
              globeViewer.surface.material[0].uniforms.sTextureAlbedo.value),
            globeViewer.globe.generateCollisionObjects(
              globeViewer.hotspotOffset,
              globeViewer.hasHotspots,
            ),
            globeViewer.globe.initCutawayGlobeAnimation(),
            globeViewer.globe.hideInnerShells());
          for (
            var n = globeViewer.globe.shells.children[2].material, i = 0;
            i < n.length;
            i++
          )
            n[i].uniforms.uEnvironmentExposure.value = 3;
          for (var r = 0; r < 1; r++)
            for (
              n = globeViewer.globe.shells.children[r].material, i = 0;
              i < n.length;
              i++
            )
              n[i].uniforms.uEnvironmentExposure.value = 0;
			  
          (
		  (globeViewer.picker = new THREE.MousePicker(
            Mb3D.CameraRig.camera(),
            document.getElementById("webgl_container"),
          )),
            (globeViewer.picker.intersectable =
              globeViewer.globe.intersectableObjects),
            (globeViewer.picker.enableLeftDrag = !1),
            (globeViewer.picker.enableMiddleDrag = !1),
            (globeViewer.picker.enableRightDrag = !1),
            (globeViewer.picker.enableLeftClick = !1),
            (globeViewer.picker.enableMiddleClick = !1),
            (globeViewer.picker.enableRightClick = !0),
            (globeViewer.picker.onLeftDrag = globeViewer.slide),
            globeViewer.initShiftPhaseAnimation(),
            globeViewer.initSpinGlobeAnimation(),
            Mb3D.GlobeModel.getRootParents().forEach(function (e) {
              globeViewer.scene.add(e);
            }),
            globeViewer.animate(),
            globeViewer.spinsOnLoad && globeViewer.animation.spinGlobe.play(),
            e());
        }));
    });
  },
  _latLonToSpherical: function (lat, lon) {
	  const phi = Math.PI/2 - THREE.Math.degToRad(lat);
	  const theta = THREE.Math.degToRad(90 + lon);
	  return THREE.Spherical(1, phi, theta);
  },
  setSubEarth: function(lat, lon) {
	  // move the camera so it is looking at the "sub earth" point on the moon
	  const pos = this._latLonToSpherical(lat, lon)
	  Mb3D.CameraRig.camera().position.setFromSpherical(pos);
	  //this.earthLight.position.setFromSpherical(pos);
  },
  setSubSun: function(lat, lon) {
	  // move the sunLight so it is above the "sub solar" point on the moon
	  this.sunLight.position.setFromSpherical(this._latLonToSpherical(lat, lon));
	  this.earthLight.position.setFromSpherical(this._latLonToSpherical(lat, lon+180));
  },
  initShiftPhaseAnimation: function () {
    function e() {
		return;
      ((globeViewer.sunLight.position.x = Math.sin(
        THREE.Math.degToRad(n.theta),
      )),
        (globeViewer.sunLight.position.z = Math.cos(
          THREE.Math.degToRad(n.theta),
        )));
    }
    var t = "Linear.easeNone",
      n = { theta: 270 };
    ((globeViewer.animation.shiftPhase = new TimelineMax({
      paused: !0,
      onUpdate: e,
    })),
      globeViewer.animation.shiftPhase
        .to(n, 2, { theta: -90, ease: t }, 0)
		/*
        .to(
          globeViewer.globe.scale,
          1,
          {
            x: 1,
            y: 1,
            z: 1,
            ease: Power2.easeOut,
          },
          0,
        )
        .to(
          globeViewer.globe.rotation,
          1,
          { z: THREE.Math.degToRad(0), ease: Power2.easeOut },
          0,
        )
        .to(
          globeViewer.globe.rotation,
          2,
          { x: THREE.Math.degToRad(-24), ease: t },
          0,
        )
        .to(
          globeViewer.globe.scale,
          1,
          { x: 1, y: 1, z: 1, ease: Power2.easeIn },
          1,
        )
        .to(
          globeViewer.globe.rotation,
          1,
          { z: THREE.Math.degToRad(6.7), ease: Power2.easeIn },
          1,
        )
		*/
		);
  },
  initSpinGlobeAnimation: function () {
    function e() {
      globeViewer.globe.expandHotspots();
    }
    ((globeViewer.animation.spinGlobe = new TimelineMax({ paused: !0 })),
      globeViewer.animation.spinGlobe
        .to(globeViewer.globe.rotation, 1.5, { y: 0, ease: Power2.easeOut }, 0)
        .call(e, [], this, 0.5));
  },
  flyCameraIntoHotspot: function (e) {
	  return;
    globeViewer.isRotatingOnAxis = !1;
    var t = globeViewer.globe.hotspotCluster.children[e].getWorldPosition(),
      n = t.clone().multiplyScalar(2.5);
    (Mb3D.CameraRig.track.curve(n, t),
      Mb3D.CameraRig.setMinMax(t.distanceTo(n), globeViewer.cameraMaxDistance),
      globeViewer.hideUnclickedHotspots(e));
  },
  flyCameraIntoEarthsPosition: function () {
	  return;
    globeViewer.isRotatingOnAxis = !1;
    var e = new THREE.Vector3(),
      t = new THREE.Vector3(3.85, 0, 0);
    (Mb3D.CameraRig.track.curve(t, e),
      Mb3D.CameraRig.setMinMax(e.distanceTo(t), globeViewer.cameraMaxDistance));
  },
  flyCameraIntoCutawayPosition: function () {
	  return;
    globeViewer.isRotatingOnAxis = !1;
    var e = new THREE.Vector3(),
      t = new THREE.Vector3(
        1.6475747061892316,
        -0.3614610765285539,
        3.460829882799833,
      );
    (Mb3D.CameraRig.track.curve(t, e),
      Mb3D.CameraRig.setMinMax(e.distanceTo(t), globeViewer.cameraMaxDistance));
  },
  flyCameraInOut: function (e) {
	  return;
    globeViewer.isRotatingOnAxis = !1;
    var t = new THREE.Vector3(),
      n = Mb3D.CameraRig.camera()
        .position.clone()
        .normalize()
        .multiplyScalar(e);
    (Mb3D.CameraRig.track.curve(n, t),
      Mb3D.CameraRig.setMinMax(t.distanceTo(n), globeViewer.cameraMaxDistance));
  },
  flyCameraOut: function () {
	  return;
    function e() {
      Mb3D.CameraRig.setMinMax();
    }
    ((globeViewer.isRotatingOnAxis = !0),
      Mb3D.CameraRig.track.reset(e),
      globeViewer.showAllHotspots());
  },
  hideUnclickedHotspots: function (e) {
    ((globeViewer.globe.hotspotCluster.userData.testForOcclusion = !1),
      (globeViewer.globe.hotspotCluster.children[e].userData.selected = !0));
  },
  showAllHotspots: function () {
    globeViewer.globe.hotspotCluster.userData.testForOcclusion = !0;
    for (var e = 0; e < globeViewer.globe.hotspotCluster.children.length; e++)
      globeViewer.globe.hotspotCluster.children[e].userData.selected = !1;
  },
  slide: function (e, t, n, i) {
    function r(e) {
      ((globeViewer.slid += parseFloat(e)),
        globeViewer.slid < 0 && (globeViewer.slid = 0),
        globeViewer.slid > 1 && (globeViewer.slid = 1));
    }
    function a(e) {
      ((globeViewer.slid -= parseFloat(e)),
        globeViewer.slid < 0 && (globeViewer.slid = 0),
        globeViewer.slid > 1 && (globeViewer.slid = 1));
    }
    n.x > 0
      ? (r(Math.abs(n.x / (0.5 * i.clientWidth)) / globeViewer.slideSpeed),
        globeViewer.animation.shiftPhase.progress(globeViewer.slid).pause(),
        $(window).trigger("update_phase", globeViewer.slid))
      : n.x < 0 &&
        (a(Math.abs(n.x / (0.5 * i.clientWidth)) / globeViewer.slideSpeed),
        globeViewer.animation.shiftPhase.progress(globeViewer.slid).pause(),
        $(window).trigger("update_phase", globeViewer.slid));
  },
  phase: function (e) {
    if (!arguments.length) return globeViewer.slid;
    ((globeViewer.slid = parseFloat(e)),
      globeViewer.animation.shiftPhase.progress(globeViewer.slid).pause());
  },
  resetFromPhase: function () {
    (globeViewer.globe.scale.set(1, 1, 1),
      globeViewer.globe.rotation.set(0, 0, 0),
      this.sunLight.position.set(1, 0, 0));
  },
  toggleDataMap: function (e) {
    var t,
      n = "Linear.easeInOut";
    ((t = arguments.length
      ? Mb3D.GlobeModel.getTexture(e)
      : globeViewer.surfaceAlbedo),
      globeViewer.showingBlend
        ? ((globeViewer.showingBlend = !globeViewer.showingBlend),
          (globeViewer.surface.material[0].uniforms.sTextureAlbedo.value = t),
          TweenLite.to(
            globeViewer.surface.material[0].uniforms.uAlbedoBlendFactor,
            1,
            { value: 0, ease: n, delay: 0.5 },
          ))
        : ((globeViewer.showingBlend = !globeViewer.showingBlend),
          (globeViewer.surface.material[0].uniforms.sTextureAlbedoBlend.value =
            t),
          TweenLite.to(
            globeViewer.surface.material[0].uniforms.uAlbedoBlendFactor,
            1,
            { value: 1, ease: n, delay: 0.5 },
          )));
  },
  toggleLights: function () {
    globeViewer.fullyLit
      ? globeViewer.toggleDirectionalLightOff()
      : globeViewer.toggleDirectionalLightOn();
  },
  toggleDirectionalLightOn: function () {
	  return;
    if (!globeViewer.sunLightIsOn) {
      var e = "Linear.easeInOut";
      ((globeViewer.sunLightIsOn = !0),
        TweenLite.to(
          globeViewer.sunLight,
          2,
          { intensity: 2, ease: e },
          0,
        ));
    }
  },
  toggleDirectionalLightOff: function () {
	  return;
    if (globeViewer.sunLightIsOn) {
      var e = "Linear.easeInOut";
      ((globeViewer.sunLightIsOn = !1),
        TweenLite.to(
          globeViewer.sunLight,
          2,
          { intensity: 0, ease: e },
          0,
        ));
    }
  },
  toggleEnvironmentLightOn: function () {
    if (!globeViewer.environmentLightIsOn) {
      var e = "Linear.easeInOut";
      ((globeViewer.environmentLightIsOn = !0),
        TweenLite.to(
          globeViewer.surface.material[0].uniforms.uEnvironmentExposure,
          2,
          { value: 20, ease: e },
          0,
        ),
        TweenLite.to(
          globeViewer.surface.material[1].uniforms.uEnvironmentExposure,
          2,
          { value: 20, ease: e },
          0,
        ),
        TweenLite.to(
          globeViewer.surface.material[2].uniforms.uEnvironmentExposure,
          2,
          { value: 20, ease: e },
          0,
        ));
    }
  },
  toggleEnvironmentLightOff: function () {
    if (globeViewer.environmentLightIsOn) {
      var e = "Linear.easeInOut";
      ((globeViewer.environmentLightIsOn = !1),
        TweenLite.to(
          globeViewer.surface.material[0].uniforms.uEnvironmentExposure,
          2,
          { value: this.environmentExposure, ease: e },
          0,
        ),
        TweenLite.to(
          globeViewer.surface.material[1].uniforms.uEnvironmentExposure,
          2,
          { value: this.environmentExposure, ease: e },
          0,
        ),
        TweenLite.to(
          globeViewer.surface.material[2].uniforms.uEnvironmentExposure,
          2,
          { value: this.environmentExposure, ease: e },
          0,
        ));
    }
  },
  toggleBloomThreshold: function () {
    globeViewer.fullyInBLoom
      ? globeViewer.toggleBloomThresholdOn()
      : globeViewer.toggleBloomThresholdOff();
  },
  toggleBloomThresholdOn: function () {
    if (!globeViewer.fullyInBLoom) {
      var e = "Linear.easeOut";
      ((globeViewer.fullyInBLoom = !0),
        TweenLite.to(globeViewer.unrealBloomPass, 0.75, {
          threshold: 0.4,
          ease: e,
        }));
    }
  },
  toggleBloomThresholdOff: function () {
    if (globeViewer.fullyInBLoom) {
      var e = "Linear.easeIn";
      ((globeViewer.fullyInBLoom = !1),
        TweenLite.to(globeViewer.unrealBloomPass, 0.75, {
          threshold: 1,
          ease: e,
          delay: 1.25,
        }));
    }
  },
  pause: function () {
    ((globeViewer.picker.enabled = !1),
      (Mb3D.CameraRig.controls().enabled = !1),
      cancelAnimationFrame(globeViewer.loop));
  },
  play: function () {
    ((globeViewer.picker.enabled = !0),
      (Mb3D.CameraRig.controls().enabled = !0),
      requestAnimationFrame(globeViewer.animate));
  },
  animate: function () {
    (globeViewer.render(),
      globeViewer.globe.update(),
      Mb3D.CameraRig.controls().update(),
      globeViewer.statsEnabled && globeViewer.stats.update(),
      (globeViewer.loop = requestAnimationFrame(globeViewer.animate)));
  },
  render: function () {
    var e = Date.now();
    (!0 === globeViewer.rotatesOnAxis &&
      !0 === globeViewer.isRotatingOnAxis &&
      (globeViewer.globe.rotation.y = 40509e-10 * e),
      globeViewer.composer.render(),
      globeViewer.navIsAnimating && globeViewer.onWindowResize());
  },
};
(

(THREE.MousePicker = function (e, t) {
  function n(e, t) {
    for (var n = t, i = new THREE.Vector2(); n; )
      ((i.x += n.offsetLeft - n.scrollLeft + n.clientLeft),
        (i.y += n.offsetTop - n.scrollTop + n.clientTop),
        (n = n.offsetParent));
    return ((i.x = e.clientX - i.x), (i.y = e.clientY - i.y), i);
  }
  function i(e, t) {
    var i = n(e, t);
    return (
      (i.x = (i.x / t.clientWidth) * 2 - 1),
      (i.y = (-i.y / t.clientHeight) * 2 + 1),
      i
    );
  }
  function r(e) {
    if (!1 !== v.enabled) {
      e.preventDefault();
      var t = v.domElement === document ? v.domElement.body : v.domElement;
      if (
        (b.copy(n(e, t)),
        g.copy(n(e, t)),
        (x = f(i(e, t))),
        e.button === v.mouseButtons.LMB)
      ) {
        if (!1 === v.enableLeftClick) return;
        E = x ? M.LMBSLIDE : M.LMBCLICK;
      } else if (e.button === v.mouseButtons.MMB) {
        if (!1 === v.enableMiddleClick) return;
        E = x ? M.MMBSLIDE : M.MMBCLICK;
      } else if (e.button === v.mouseButtons.RMB) {
        if (!1 === v.enableRightClick) return;
        E = x ? M.RMBSLIDE : M.RMBCLICK;
      }
      E !== M.NONE &&
        (document.addEventListener("mousemove", a, !1),
        document.addEventListener("mouseup", o, !1),
        v.dispatchEvent(T));
    }
  }
  function a(e) {
    if (!1 !== v.enabled) {
      e.preventDefault();
      var t = v.domElement === document ? v.domElement.body : v.domElement;
      if ((_.copy(n(e, t)), y.subVectors(_, g), E === M.LMBSLIDE)) {
        if (!1 === v.enableLeftDrag) return;
        "function" == typeof v.onLeftDrag && v.onLeftDrag(g, _, y, t);
      } else if (E === M.MMBSLIDE) {
        if (!1 === v.enableMiddleDrag) return;
        "function" == typeof v.onMiddleDrag && v.onMiddleDrag(g, _, y, t);
      } else if (E === M.RMBSLIDE) {
        if (!1 === v.enableRightDrag) return;
        "function" == typeof v.onRightDrag && v.onRightDrag(g, _, y, t);
      }
      g.copy(_);
    }
  }
  function o(e) {
    if (!1 !== v.enabled) {
      var t = v.domElement === document ? v.domElement.body : v.domElement,
        r = i(e, t);
      ((x = f(r)),
        Math.abs(b.x - n(e, t).x) < 3 && Math.abs(b.y - n(e, t).y) < 3 && h(r),
        document.removeEventListener("mousemove", a, !1),
        document.removeEventListener("mouseup", o, !1),
        v.dispatchEvent(S),
        (E = M.NONE));
    }
  }
  function s(e) {
    !1 !== v.enabled &&
      (e.preventDefault(),
      d(i(e, v.domElement === document ? v.domElement.body : v.domElement)));
  }
  function l(e) {
    if (!1 !== v.enabled) {
      e.preventDefault();
      var t = v.domElement === document ? v.domElement.body : v.domElement;
      switch (e.touches.length) {
        case 1:
          if (
            (b.copy(n(e.touches[0], t)),
            g.copy(n(e.touches[0], t)),
            !1 === v.enableLeftClick)
          )
            return;
          E = M.LMBSLIDE;
          break;
        case 2:
        case 3:
          break;
        default:
          E = M.NONE;
      }
      E !== M.NONE && v.dispatchEvent(T);
    }
  }
  function c(e) {
    if (!1 !== v.enabled) {
      e.preventDefault();
      var t = v.domElement === document ? v.domElement.body : v.domElement;
      switch (e.touches.length) {
        case 1:
          if (
            (_.copy(n(e.touches[0], t)),
            y.subVectors(_, g),
            !1 === v.enableLeftDrag)
          )
            return;
          "function" == typeof v.onLeftDrag && v.onLeftDrag(g, _, y, t);
          break;
        case 2:
        case 3:
          break;
        default:
          E = M.NONE;
      }
      g.copy(_);
    }
  }
  function u(e) {
    if (!1 !== v.enabled) {
      var t = v.domElement === document ? v.domElement.body : v.domElement,
        r = i(e.changedTouches[0], t);
      ((x = f(r)),
        Math.abs(b.x - n(e, t).x) < 3 && Math.abs(b.y - n(e, t).y) < 3 && h(r),
        v.dispatchEvent(S),
        (E = M.NONE));
    }
  }
  function h(e) {
    if (
      ((v.intersectedByClickRays = p(e)), E === M.LMBSLIDE || E === M.LMBCLICK)
    ) {
      if (!1 === v.enableLeftClick) return;
      "function" == typeof v.onLeftClick &&
        v.onLeftClick(v.intersectedByClickRays);
    } else if (E === M.MMBSLIDE || E === M.MMBCLICK) {
      if (!1 === v.enableMiddleClick) return;
      "function" == typeof v.onMiddleClick &&
        v.onMiddleClick(v.intersectedByClickRays);
    } else if (E === M.RMBSLIDE || E === M.RMBCLICK) {
      if (!1 === v.enableRightClick) return;
      "function" == typeof v.onRightClick &&
        v.onRightClick(v.intersectedByClickRays);
    }
  }
  function d(e) {
    ((v.intersectedByHoverRays = p(e)),
      E !== M.LMBSLIDE &&
        E !== M.MMBSLIDE &&
        E !== M.RMBSLIDE &&
        E !== M.LMBCLICK &&
        E !== M.MMBCLICK &&
        E !== M.RMBCLICK &&
        !1 !== v.enableHover &&
        "function" == typeof v.onHover &&
        v.onHover(v.intersectedByHoverRays));
  }
  function p(e) {
    var t = new THREE.Vector3();
    return (
      t.set(e.x, e.y, 0.5),
      t.unproject(v.object),
      t.sub(v.object.position),
      t.normalize(),
      w.set(v.object.position, t),
      w.intersectObjects(v.intersectable, !0)
    );
  }
  function f(e) {
    return !!p(e).length;
  }
  function m(e) {
    e.preventDefault();
  }
  ((this.object = e),
    (this.domElement = void 0 !== t ? t : document),
    (this.enabled = !0),
    (this.enableLeftDrag = !0),
    (this.enableMiddleDrag = !0),
    (this.enableRightDrag = !0),
    (this.enableLeftClick = !0),
    (this.enableMiddleClick = !0),
    (this.enableRightClick = !0),
    (this.enableHover = !0),
    (this.mouseButtons = {
      LMB: THREE.MOUSE.LEFT,
      MMB: THREE.MOUSE.MIDDLE,
      RMB: THREE.MOUSE.RIGHT,
    }),
    (this.intersectable = []),
    (this.intersectedByClickRays = []),
    (this.intersectedByHoverRays = []),
    (this.onLeftDrag = null),
    (this.onMiddleDrag = null),
    (this.onRightDrag = null),
    (this.onLeftClick = null),
    (this.onMiddleClick = null),
    (this.onRightClick = null),
    (this.onHover = null));
  var v = this,
    g = new THREE.Vector2(),
    _ = new THREE.Vector2(),
    y = new THREE.Vector2(),
    b = new THREE.Vector2(),
    w = new THREE.Raycaster(),
    M = {
      NONE: -1,
      LMBSLIDE: 0,
      MMBSLIDE: 1,
      RMBSLIDE: 2,
      LMBCLICK: 3,
      MMBCLICK: 4,
      RMBCLICK: 5,
    },
    E = M.NONE,
    x = !1,
    T = { type: "start" },
    S = { type: "end" };
  ((this.dispose = function () {
    (this.domElement.removeEventListener("contextmenu", m, !1),
      this.domElement.removeEventListener("mousedown", r, !1),
      this.domElement.removeEventListener("mousemove", s, !1),
      this.domElement.removeEventListener("touchstart", l, !1),
      this.domElement.removeEventListener("touchend", u, !1),
      this.domElement.removeEventListener("touchmove", c, !1),
      document.removeEventListener("mousemove", a, !1),
      document.removeEventListener("mouseup", o, !1));
  }),
    this.domElement.addEventListener("contextmenu", m, !1),
    this.domElement.addEventListener("mousedown", r, !1),
    this.domElement.addEventListener("mousemove", s, !1),
    this.domElement.addEventListener("touchstart", l, !1),
    this.domElement.addEventListener("touchend", u, !1),
    this.domElement.addEventListener("touchmove", c, !1));
}),
  (THREE.MousePicker.prototype = Object.create(
    THREE.EventDispatcher.prototype,
  )),
  (THREE.MousePicker.prototype.constructor = THREE.MousePicker),
  (THREE.MousePicker.prototype.getIntersected = function () {
    return {
      intersectedByClickRays: this.intersectedByClickRays,
      intersectedByHoverRays: this.intersectedByHoverRays,
    };
  }),
  (THREE.MousePicker.prototype.on = function () {
    return {
      intersectedByClickRays: this.intersectedByClickRays,
      intersectedByHoverRays: this.intersectedByHoverRays,
    };
  }),
  
  (THREE.UnrealBloomPass = function (e, t, n, i) {
    (THREE.Pass.call(this),
      (this.strength = void 0 !== t ? t : 1),
      (this.radius = n),
      (this.threshold = i),
      (this.resolution =
        void 0 !== e
          ? new THREE.Vector2(e.x, e.y)
          : new THREE.Vector2(256, 256)));
    var r = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    };
    ((this.renderTargetsHorizontal = []),
      (this.renderTargetsVertical = []),
      (this.nMips = 5));
    var a = Math.round(this.resolution.x / 2),
      o = Math.round(this.resolution.y / 2);
    ((this.renderTargetBright = new THREE.WebGLRenderTarget(a, o, r)),
      (this.renderTargetBright.texture.name = "UnrealBloomPass.bright"),
      (this.renderTargetBright.texture.generateMipmaps = !1));
    for (var s = 0; s < this.nMips; s++) {
      var l;
      (((l = new THREE.WebGLRenderTarget(a, o, r)).texture.name =
        "UnrealBloomPass.h" + s),
        (l.texture.generateMipmaps = !1),
        this.renderTargetsHorizontal.push(l),
        ((l = new THREE.WebGLRenderTarget(a, o, r)).texture.name =
          "UnrealBloomPass.v" + s),
        (l.texture.generateMipmaps = !1),
        this.renderTargetsVertical.push(l),
        (a = Math.round(a / 2)),
        (o = Math.round(o / 2)));
    }
    void 0 === THREE.LuminosityHighPassShader &&
      console.error(
        "THREE.UnrealBloomPass relies on THREE.LuminosityHighPassShader",
      );
    var c = THREE.LuminosityHighPassShader;
    ((this.highPassUniforms = THREE.UniformsUtils.clone(c.uniforms)),
      (this.highPassUniforms.luminosityThreshold.value = i),
      (this.highPassUniforms.smoothWidth.value = 0.01),
      (this.materialHighPassFilter = new THREE.ShaderMaterial({
        uniforms: this.highPassUniforms,
        vertexShader: c.vertexShader,
        fragmentShader: c.fragmentShader,
        defines: {},
      })),
      (this.separableBlurMaterials = []));
    var u = [3, 5, 7, 9, 11];
    for (
      a = Math.round(this.resolution.x / 2),
        o = Math.round(this.resolution.y / 2),
        s = 0;
      s < this.nMips;
      s++
    )
      (this.separableBlurMaterials.push(this.getSeperableBlurMaterial(u[s])),
        (this.separableBlurMaterials[s].uniforms.texSize.value =
          new THREE.Vector2(a, o)),
        (a = Math.round(a / 2)),
        (o = Math.round(o / 2)));
    ((this.compositeMaterial = this.getCompositeMaterial(this.nMips)),
      (this.compositeMaterial.uniforms.blurTexture1.value =
        this.renderTargetsVertical[0].texture),
      (this.compositeMaterial.uniforms.blurTexture2.value =
        this.renderTargetsVertical[1].texture),
      (this.compositeMaterial.uniforms.blurTexture3.value =
        this.renderTargetsVertical[2].texture),
      (this.compositeMaterial.uniforms.blurTexture4.value =
        this.renderTargetsVertical[3].texture),
      (this.compositeMaterial.uniforms.blurTexture5.value =
        this.renderTargetsVertical[4].texture),
      (this.compositeMaterial.uniforms.bloomStrength.value = t),
      (this.compositeMaterial.uniforms.bloomRadius.value = 0.1),
      (this.compositeMaterial.needsUpdate = !0));
    var h = [1, 0.8, 0.6, 0.4, 0.2];
    ((this.compositeMaterial.uniforms.bloomFactors.value = h),
      (this.bloomTintColors = [
        new THREE.Vector3(1, 1, 1),
        new THREE.Vector3(1, 1, 1),
        new THREE.Vector3(1, 1, 1),
        new THREE.Vector3(1, 1, 1),
        new THREE.Vector3(1, 1, 1),
      ]),
      (this.compositeMaterial.uniforms.bloomTintColors.value =
        this.bloomTintColors),
      void 0 === THREE.CopyShader &&
        console.error("THREE.BloomPass relies on THREE.CopyShader"));
    var d = THREE.CopyShader;
    ((this.copyUniforms = THREE.UniformsUtils.clone(d.uniforms)),
      (this.copyUniforms.opacity.value = 1),
      (this.materialCopy = new THREE.ShaderMaterial({
        uniforms: this.copyUniforms,
        vertexShader: d.vertexShader,
        fragmentShader: d.fragmentShader,
        blending: THREE.AdditiveBlending,
        depthTest: !1,
        depthWrite: !1,
        transparent: !0,
      })),
      (this.enabled = !0),
      (this.needsSwap = !1),
      (this.oldClearColor = new THREE.Color()),
      (this.oldClearAlpha = 1),
      (this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)),
      (this.scene = new THREE.Scene()),
      (this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null)),
      (this.quad.frustumCulled = !1),
      this.scene.add(this.quad));
  }),
  (THREE.UnrealBloomPass.prototype = Object.assign(
    Object.create(THREE.Pass.prototype),
    {
      constructor: THREE.UnrealBloomPass,
      dispose: function () {
        for (var e = 0; e < this.renderTargetsHorizontal.length; e++)
          this.renderTargetsHorizontal[e].dispose();
        for (e = 0; e < this.renderTargetsVertical.length; e++)
          this.renderTargetsVertical[e].dispose();
        this.renderTargetBright.dispose();
      },
      setSize: function (e, t) {
        var n = Math.round(e / 2),
          i = Math.round(t / 2);
        this.renderTargetBright.setSize(n, i);
        for (var r = 0; r < this.nMips; r++)
          (this.renderTargetsHorizontal[r].setSize(n, i),
            this.renderTargetsVertical[r].setSize(n, i),
            (this.separableBlurMaterials[r].uniforms.texSize.value =
              new THREE.Vector2(n, i)),
            (n = Math.round(n / 2)),
            (i = Math.round(i / 2)));
      },
      render: function (e, t, n, i, r) {
        (this.oldClearColor.copy(e.getClearColor()),
          (this.oldClearAlpha = e.getClearAlpha()));
        var a = e.autoClear;
        ((e.autoClear = !1),
          e.setClearColor(new THREE.Color(0, 0, 0), 0),
          r && e.context.disable(e.context.STENCIL_TEST),
          (this.highPassUniforms.tDiffuse.value = n.texture),
          (this.highPassUniforms.luminosityThreshold.value = this.threshold),
          (this.quad.material = this.materialHighPassFilter),
          e.render(this.scene, this.camera, this.renderTargetBright, !0));
        for (var o = this.renderTargetBright, s = 0; s < this.nMips; s++)
          ((this.quad.material = this.separableBlurMaterials[s]),
            (this.separableBlurMaterials[s].uniforms.colorTexture.value =
              o.texture),
            (this.separableBlurMaterials[s].uniforms.direction.value =
              THREE.UnrealBloomPass.BlurDirectionX),
            e.render(
              this.scene,
              this.camera,
              this.renderTargetsHorizontal[s],
              !0,
            ),
            (this.separableBlurMaterials[s].uniforms.colorTexture.value =
              this.renderTargetsHorizontal[s].texture),
            (this.separableBlurMaterials[s].uniforms.direction.value =
              THREE.UnrealBloomPass.BlurDirectionY),
            e.render(
              this.scene,
              this.camera,
              this.renderTargetsVertical[s],
              !0,
            ),
            (o = this.renderTargetsVertical[s]));
        ((this.quad.material = this.compositeMaterial),
          (this.compositeMaterial.uniforms.bloomStrength.value = this.strength),
          (this.compositeMaterial.uniforms.bloomRadius.value = this.radius),
          (this.compositeMaterial.uniforms.bloomTintColors.value =
            this.bloomTintColors),
          e.render(
            this.scene,
            this.camera,
            this.renderTargetsHorizontal[0],
            !0,
          ),
          (this.quad.material = this.materialCopy),
          (this.copyUniforms.tDiffuse.value =
            this.renderTargetsHorizontal[0].texture),
          r && e.context.enable(e.context.STENCIL_TEST),
          e.render(this.scene, this.camera, n, !1),
          e.setClearColor(this.oldClearColor, this.oldClearAlpha),
          (e.autoClear = a));
      },
      getSeperableBlurMaterial: function (e) {
        return new THREE.ShaderMaterial({
          defines: { KERNEL_RADIUS: e, SIGMA: e },
          uniforms: {
            colorTexture: { value: null },
            texSize: { value: new THREE.Vector2(0.5, 0.5) },
            direction: { value: new THREE.Vector2(0.5, 0.5) },
          },
          vertexShader:
            "varying vec2 vUv;\n        void main() {\n          vUv = uv;\n          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n        }",
          fragmentShader:
            "#include <common>        varying vec2 vUv;\n        uniform sampler2D colorTexture;\n        uniform vec2 texSize;        uniform vec2 direction;                float gaussianPdf(in float x, in float sigma) {          return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;        }        void main() {\n          vec2 invSize = 1.0 / texSize;          float fSigma = float(SIGMA);          float weightSum = gaussianPdf(0.0, fSigma);          vec4 diffuseSum = texture2D( colorTexture, vUv) * weightSum;          for( int i = 1; i < KERNEL_RADIUS; i ++ ) {            float x = float(i);            float w = gaussianPdf(x, fSigma);            vec2 uvOffset = direction * invSize * x;            vec4 sample1 = texture2D( colorTexture, vUv + uvOffset);            vec4 sample2 = texture2D( colorTexture, vUv - uvOffset);            diffuseSum += (sample1 + sample2) * w;            weightSum += 2.0 * w;          }          gl_FragColor = vec4(diffuseSum/weightSum);\n        }",
        });
      },
      getCompositeMaterial: function (e) {
        return new THREE.ShaderMaterial({
          defines: { NUM_MIPS: e },
          uniforms: {
            blurTexture1: { value: null },
            blurTexture2: { value: null },
            blurTexture3: { value: null },
            blurTexture4: { value: null },
            blurTexture5: { value: null },
            dirtTexture: { value: null },
            bloomStrength: { value: 1 },
            bloomFactors: { value: null },
            bloomTintColors: { value: null },
            bloomRadius: { value: 0 },
          },
          vertexShader:
            "varying vec2 vUv;\n        void main() {\n          vUv = uv;\n          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n        }",
          fragmentShader:
            "varying vec2 vUv;        uniform sampler2D blurTexture1;        uniform sampler2D blurTexture2;        uniform sampler2D blurTexture3;        uniform sampler2D blurTexture4;        uniform sampler2D blurTexture5;        uniform sampler2D dirtTexture;        uniform float bloomStrength;        uniform float bloomRadius;        uniform float bloomFactors[NUM_MIPS];        uniform vec3 bloomTintColors[NUM_MIPS];                float lerpBloomFactor(const in float factor) {           float mirrorFactor = 1.2 - factor;          return mix(factor, mirrorFactor, bloomRadius);        }                void main() {          gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +                            lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +                            lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +                            lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +                            lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );        }",
        });
      },
    },
  )),
  (THREE.UnrealBloomPass.BlurDirectionX = new THREE.Vector2(1, 0)),
  (THREE.UnrealBloomPass.BlurDirectionY = new THREE.Vector2(0, 1)));
