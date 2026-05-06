'use strict';

/* 1. CATÁLOGO DE PRODUCTOS */
const PRODUCTOS = [
  { id: 1,  nombre: 'Monstera Deliciosa',   categoria: 'Interior',     precio: 24.90, emoji: '🌿', imagen: 'resources/mosteradeliciosa.png',etiqueta: 'Más vendido', descripcion: 'Hoja perforada, fácil cuidado, ideal para ambientes luminosos.' },
  { id: 2,  nombre: 'Cactus Saguaro',        categoria: 'Cactus',       precio: 8.50,  emoji: '🌵', imagen: 'resources/cactussaguaro.png',etiqueta: null,descripcion: 'Resistente y de bajo mantenimiento. Perfecto para principiantes.' },
  { id: 3,  nombre: 'Orquídea Phalaenopsis', categoria: 'Flores',       precio: 19.95, emoji: '🌸', imagen: 'resources/orquídeaphalaenopsis.png',etiqueta: 'Nuevo',       descripcion: 'Floración espectacular. Regala color y elegancia a tu espacio.' },
  { id: 4,  nombre: 'Pala de Jardinería',    categoria: 'Herramientas', precio: 12.00, emoji: '🪴', imagen: 'resources/palajardinero.png', etiqueta: null,descripcion: 'Acero inoxidable con mango ergonómico de madera de haya.' },
  { id: 5,  nombre: 'Lavanda Provence',      categoria: 'Exterior',     precio: 6.90,  emoji: '💐', imagen: 'resources/lavandaprovence.png',etiqueta: null,descripcion: 'Aroma intenso, repele insectos y atrae a las mariposas.' },
  { id: 6,  nombre: 'Ficus Lyrata',          categoria: 'Interior',     precio: 39.00, emoji: '🌱', imagen: 'resources/ficuslyrata.png',etiqueta: 'Premium',descripcion: 'La planta de moda en el diseño de interiores. Porte majestuoso.' },
  { id: 7,  nombre: 'Regadera Cobre',        categoria: 'Herramientas', precio: 29.90, emoji: '🚿', imagen: 'resources/regaderacobre.png',etiqueta: null,descripcion: 'Diseño artesanal en cobre con boquilla de lluvia fina.' },
  { id: 8,  nombre: 'Suculenta Mix',         categoria: 'Cactus',       precio: 4.95,  emoji: '🪴', imagen: 'resources/suculentamix.png',etiqueta: null,descripcion: 'Pack de 3 suculentas variadas. Coloridas y resistentes.' },
  { id: 9,  nombre: 'Girasol Enano',         categoria: 'Flores',       precio: 5.50,  emoji: '🌻', imagen: 'resources/girasolenano.png',etiqueta: null,descripcion: 'Alegre y vibrante. Cultívalo en maceta o jardín exterior.' },
  { id: 10, nombre: 'Tierra Premium Bio',    categoria: 'Herramientas', precio: 7.95,  emoji: '🌍', imagen: 'resources/tierrapremiumbio.png',etiqueta: null,descripcion: 'Sustrato ecológico enriquecido con compost vegetal.' },
  { id: 11, nombre: 'Palmera Kentia',        categoria: 'Interior',     precio: 55.00, emoji: '🌴', imagen: 'resources/palmerakentia.png',etiqueta: 'Premium',descripcion: 'Elegancia tropical. Purifica el aire y crece despacio.' },
  { id: 12, nombre: 'Rosa Trepadora',        categoria: 'Exterior',     precio: 14.50, emoji: '🌹', imagen: 'resources/rosatrepadora.png',etiqueta: null,descripcion: 'Floración abundante de mayo a octubre en múltiples colores.' },
];

/*2. MÓDULO DE SESIÓN DE USUARIO */
const Sesion = (() => {
  let _usuario = null;

  try {
    const datosGuardados = sessionStorage.getItem('verdelia_usuario');
    if (datosGuardados) _usuario = JSON.parse(datosGuardados);
  } catch (error) { }

  function guardarSesion() {
    try {
      if (_usuario) {
        sessionStorage.setItem('verdelia_usuario', JSON.stringify(_usuario));
      } else {
        sessionStorage.removeItem('verdelia_usuario');
      }
    } catch (error) { }
  }

  return {
    get estaConectado() { return _usuario !== null; },
    get usuario() { return _usuario; },

    iniciarSesion(nombre, correo) {
      _usuario = { nombre, correo, fechaAcceso: new Date().toISOString() };
      guardarSesion();
      pintarCabecera();
    },

    cerrarSesion() {
      _usuario = null;
      guardarSesion();
      pintarCabecera();
    },
  };
})();

/*3. MÓDULO DEL CARRITO DE COMPRAS*/
const Carrito = (() => {
  let _articulos = [];

  function agregarPorId(idProducto) {
    const producto = PRODUCTOS.find(p => p.id === idProducto);
    if (!producto) return false;

    const yaExiste = _articulos.find(a => a.idProducto === idProducto);
    if (yaExiste) {
      yaExiste.cantidad += 1;
    } else {
      _articulos.push({ idProducto, cantidad: 1 });
    }
    return true;
  }

  function eliminarPorId(idProducto) {
    _articulos = _articulos.filter(a => a.idProducto !== idProducto);
  }

  function vaciar() {
    _articulos = [];
  }

  function calcularSubtotal() {
    return _articulos.reduce((acumulado, articulo) => {
      const producto = PRODUCTOS.find(p => p.id === articulo.idProducto);
      return acumulado + (producto ? producto.precio * articulo.cantidad : 0);
    }, 0);
  }

  function calcularEnvio(subtotal) {
    if (subtotal === 0)  return 0;
    if (subtotal >= 50)  return 0;
    if (subtotal >= 20)  return 4.95;
    return 6.95;
  }

  function obtenerArticulosCompletos() {
    return _articulos.map(articulo => ({
      ...articulo,
      producto: PRODUCTOS.find(p => p.id === articulo.idProducto),
    }));
  }

  return {
    agregarPorId,
    eliminarPorId,
    vaciar,
    calcularSubtotal,
    calcularEnvio,
    obtenerArticulosCompletos,
    get totalUnidades() { return _articulos.reduce((s, a) => s + a.cantidad, 0); },
    get articulos() { return [..._articulos]; },
  };
})();

/* 4. MÓDULO DE CATÁLOGO*/
const Catalogo = (() => {
  let _categoriaActiva = 'Todos';
  let _ordenActual = 'defecto';

  function obtenerCategorias() {
    const categorias = [...new Set(PRODUCTOS.map(p => p.categoria))];
    return ['Todos', ...categorias.sort()];
  }

  function filtrarPorCategoria(productos, categoria) {
    if (categoria === 'Todos') return [...productos];
    return productos.filter(p => p.categoria === categoria);
  }

  function ordenarProductos(productos, criterio) {
    const copia = [...productos];
    switch (criterio) {
      case 'precio-asc':  return copia.sort((a, b) => a.precio - b.precio);
      case 'precio-desc': return copia.sort((a, b) => b.precio - a.precio);
      case 'nombre-az':   return copia.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
      default:            return copia.sort((a, b) => a.id - b.id);
    }
  }

  function obtenerVisibles() {
    let lista = filtrarPorCategoria(PRODUCTOS, _categoriaActiva);
    lista = ordenarProductos(lista, _ordenActual);
    return lista;
  }

  return {
    obtenerCategorias,
    obtenerVisibles,
    establecerCategoria(cat) { _categoriaActiva = cat; },
    establecerOrden(criterio) { _ordenActual = criterio; },
    get categoriaActiva() { return _categoriaActiva; },
  };
})();

/* 5. PINTAR CABECERA*/
const botonUsuario  = document.getElementById('boton-usuario');
const avatarUsuario = document.getElementById('avatar-usuario');
const nombreUsuario = document.getElementById('nombre-usuario');

function pintarCabecera() {
  if (Sesion.estaConectado) {
    const iniciales = Sesion.usuario.nombre
      .split(' ')
      .map(palabra => palabra[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    avatarUsuario.textContent    = iniciales;
    nombreUsuario.textContent    = Sesion.usuario.nombre.split(' ')[0];
    nombreUsuario.style.display  = 'inline';
    botonUsuario.title = `Sesión: ${Sesion.usuario.nombre} — Haz clic para cerrar sesión`;
  } else {
    avatarUsuario.textContent   = '?';
    nombreUsuario.textContent   = '';
    nombreUsuario.style.display = 'none';
    botonUsuario.title = 'Iniciar sesión';
  }
}

/* 6. PINTAR FILTROS*/
const contenedorFiltros = document.getElementById('contenedor-filtros');

function pintarFiltros() {
  contenedorFiltros.innerHTML = '';

  Catalogo.obtenerCategorias().forEach(categoria => {
    const boton = document.createElement('button');
    boton.className = 'filtro-pastilla' + (categoria === Catalogo.categoriaActiva ? ' activo' : '');
    boton.textContent = categoria;
    boton.setAttribute('data-categoria', categoria);

    boton.addEventListener('click', () => {
      Catalogo.establecerCategoria(categoria);
      pintarFiltros();
      pintarProductos();
    });

    contenedorFiltros.appendChild(boton);
  });
}

/* 7. PINTAR PRODUCTOS
   Si la imagen no carga  se muestra el emoji como fallback. */
const cuadriculaProductos = document.getElementById('cuadricula-productos');

function pintarProductos() {
  const lista = Catalogo.obtenerVisibles();
  cuadriculaProductos.innerHTML = '';

  if (lista.length === 0) {
    const mensaje = document.createElement('p');
    mensaje.className = 'sin-resultados';
    mensaje.textContent = 'No hay productos en esta categoría.';
    cuadriculaProductos.appendChild(mensaje);
    return;
  }

  lista.forEach(producto => {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'tarjeta';
    tarjeta.setAttribute('role', 'listitem');

    tarjeta.innerHTML = `
      <div class="tarjeta__imagen">
        <img
          class="tarjeta__foto"
          src="${producto.imagen}"
          alt="${producto.nombre}"
          loading="lazy"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        />
        <!-- Fallback con emoji si la imagen no carga -->
        <span class="tarjeta__emoji-fallback" aria-hidden="true" style="display:none">${producto.emoji}</span>
        ${producto.etiqueta ? `<span class="tarjeta__etiqueta">${producto.etiqueta}</span>` : ''}
      </div>
      <div class="tarjeta__cuerpo">
        <p class="tarjeta__categoria">${producto.categoria}</p>
        <h3 class="tarjeta__nombre">${producto.nombre}</h3>
        <p class="tarjeta__descripcion">${producto.descripcion}</p>
        <div class="tarjeta__pie">
          <span class="tarjeta__precio">${producto.precio.toFixed(2)} €</span>
          <button
            class="tarjeta__boton-agregar"
            data-id="${producto.id}"
            aria-label="Añadir ${producto.nombre} al carrito"
          >
            <span>+ Añadir</span>
          </button>
        </div>
      </div>
    `;

    tarjeta.querySelector('.tarjeta__boton-agregar').addEventListener('click', (evento) => {
      gestionarAgregarAlCarrito(producto.id, evento.currentTarget);
    });

    cuadriculaProductos.appendChild(tarjeta);
  });
}

/* 8. PINTAR EL PANEL DEL CARRITO*/
const contadorCarrito    = document.getElementById('contador-carrito');
const listaCarrito       = document.getElementById('lista-carrito');
const pieCarrito         = document.getElementById('pie-carrito');
const resumenCarrito     = document.getElementById('resumen-carrito');

function pintarCarrito() {
  const totalUnidades = Carrito.totalUnidades;
  contadorCarrito.textContent = totalUnidades;
  contadorCarrito.classList.add('rebote');
  setTimeout(() => contadorCarrito.classList.remove('rebote'), 350);

  const articulosCompletos = Carrito.obtenerArticulosCompletos();
  listaCarrito.innerHTML = '';

  if (articulosCompletos.length === 0) {
    pieCarrito.style.display = 'none';
    listaCarrito.innerHTML = `
      <div class="carrito-vacio">
        <span class="carrito-vacio__icono">🌱</span>
        <p>Tu carrito está vacío</p>
        <p style="font-size:.8rem">Añade algunas plantas para comenzar</p>
      </div>`;
    return;
  }

  pieCarrito.style.display = 'flex';

  articulosCompletos.forEach(({ producto, cantidad }) => {
    const elemento = document.createElement('div');
    elemento.className = 'articulo-carrito';
    elemento.innerHTML = `
      <div class="articulo-carrito__icono">${producto.emoji}</div>
      <div class="articulo-carrito__info">
        <p class="articulo-carrito__nombre">${producto.nombre}</p>
        <p class="articulo-carrito__cantidad">${cantidad} × ${producto.precio.toFixed(2)} €</p>
      </div>
      <span class="articulo-carrito__precio">${(producto.precio * cantidad).toFixed(2)} €</span>
      <button
        class="articulo-carrito__eliminar"
        data-id="${producto.id}"
        aria-label="Eliminar ${producto.nombre} del carrito"
      >✕</button>
    `;

    elemento.querySelector('.articulo-carrito__eliminar').addEventListener('click', () => {
      Carrito.eliminarPorId(producto.id);
      pintarCarrito();
      pintarProductos();
    });

    listaCarrito.appendChild(elemento);
  });

  const subtotal       = Carrito.calcularSubtotal();
  const costoEnvio     = Carrito.calcularEnvio(subtotal);
  const total          = subtotal + costoEnvio;
  const minimoGratis   = 50;
  const faltaParaGratis = Math.max(0, minimoGratis - subtotal);

  resumenCarrito.innerHTML = `
    <div class="fila-resumen">
      <span>Subtotal (${totalUnidades} art.)</span>
      <span>${subtotal.toFixed(2)} €</span>
    </div>
    <div class="fila-resumen">
      <span>Envío</span>
      <span class="${costoEnvio === 0 ? 'resaltado' : ''}">
        ${costoEnvio === 0 ? 'GRATIS' : costoEnvio.toFixed(2) + ' €'}
      </span>
    </div>
    ${faltaParaGratis > 0
      ? `<div class="fila-resumen" style="font-size:.74rem;color:var(--color-acento)">
           <span>Añade ${faltaParaGratis.toFixed(2)} € más para envío gratis</span>
         </div>`
      : ''}
    <div class="fila-resumen total">
      <span>Total</span>
      <span>${total.toFixed(2)} €</span>
    </div>
  `;
}

/*9. GESTIONAR AÑADIR AL CARRITO*/
function gestionarAgregarAlCarrito(idProducto, boton) {
  Carrito.agregarPorId(idProducto);
  pintarCarrito();

  boton.classList.add('agregado');
  boton.innerHTML = '<span>✓ Añadido</span>';
  setTimeout(() => {
    boton.classList.remove('agregado');
    boton.innerHTML = '<span>+ Añadir</span>';
  }, 1200);

  const producto = PRODUCTOS.find(p => p.id === idProducto);
  mostrarNotificacion(`${producto.emoji} ${producto.nombre} añadido al carrito`);
}

/* 10. NOTIFICACIONES EMERGENTES*/
const contenedorNotificaciones = document.getElementById('contenedor-notificaciones');

function mostrarNotificacion(mensaje, duracion = 2800) {
  const notificacion = document.createElement('div');
  notificacion.className = 'notificacion';
  notificacion.textContent = mensaje;
  contenedorNotificaciones.appendChild(notificacion);

  setTimeout(() => {
    notificacion.classList.add('saliendo');
    setTimeout(() => notificacion.remove(), 320);
  }, duracion);
}

/* 11. ABRIR Y CERRAR EL CARRITO*/
const panelCarrito  = document.getElementById('panel-carrito');
const fondoCarrito  = document.getElementById('fondo-carrito');

function abrirCarrito() {
  panelCarrito.classList.add('abierto');
  fondoCarrito.classList.add('abierto');
  document.body.style.overflow = 'hidden';
}

function cerrarCarrito() {
  panelCarrito.classList.remove('abierto');
  fondoCarrito.classList.remove('abierto');
  document.body.style.overflow = '';
}

document.getElementById('boton-carrito').addEventListener('click', abrirCarrito);
document.getElementById('boton-cerrar-carrito').addEventListener('click', cerrarCarrito);
fondoCarrito.addEventListener('click', cerrarCarrito);

document.getElementById('boton-vaciar').addEventListener('click', () => {
  Carrito.vaciar();
  pintarCarrito();
  pintarProductos();
  mostrarNotificacion(' Carrito vaciado');
});

document.getElementById('boton-comprar').addEventListener('click', () => {
  if (!Sesion.estaConectado) {
    cerrarCarrito();
    abrirModal();
    mostrarNotificacion(' Inicia sesión para finalizar tu compra');
  } else {
    mostrarNotificacion(' ¡Pedido  con éxito! Gracias, ' + Sesion.usuario.nombre.split(' ')[0]);
    Carrito.vaciar();
    pintarCarrito();
    pintarProductos();
    cerrarCarrito();
  }
});

/* 12. MODAL DE SESIÓN*/
const fondoModal = document.getElementById('fondo-modal');

function abrirModal()  { fondoModal.classList.add('abierto'); }
function cerrarModal() { fondoModal.classList.remove('abierto'); }

document.getElementById('boton-cerrar-modal').addEventListener('click', cerrarModal);
fondoModal.addEventListener('click', evento => {
  if (evento.target === fondoModal) cerrarModal();
});

botonUsuario.addEventListener('click', () => {
  if (Sesion.estaConectado) {
    Sesion.cerrarSesion();
    mostrarNotificacion(' Sesión cerrada. ¡Hasta pronto!');
  } else {
    abrirModal();
  }
});

document.getElementById('boton-iniciar-sesion').addEventListener('click', () => {
  const nombre = document.getElementById('campo-nombre').value.trim();
  const correo = document.getElementById('campo-correo').value.trim();
  const clave  = document.getElementById('campo-clave').value;

  if (!nombre)                          { mostrarNotificacion('❗ Introduce tu nombre');         return; }
  if (!correo || !correo.includes('@')) { mostrarNotificacion('❗ Correo electrónico inválido'); return; }
  if (clave.length < 4)                 { mostrarNotificacion('❗ Contraseña demasiado corta');  return; }

  Sesion.iniciarSesion(nombre, correo);
  cerrarModal();
  mostrarNotificacion(`🌿 ¡Bienvenid@, ${nombre.split(' ')[0]}!`);

  ['campo-nombre', 'campo-correo', 'campo-clave'].forEach(id => {
    document.getElementById(id).value = '';
  });
});

['campo-nombre', 'campo-correo', 'campo-clave'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', evento => {
    if (evento.key === 'Enter') document.getElementById('boton-iniciar-sesion').click();
  });
});

document.getElementById('enlace-registro').addEventListener('click', () => {
  mostrarNotificacion('📝 Registro: usa el mismo formulario de demo');
});

/* 13. SELECTOR DE ORDEN*/
document.getElementById('selector-orden').addEventListener('change', evento => {
  Catalogo.establecerOrden(evento.target.value);
  pintarProductos();
});

/* 14. TECLA ESCAPE*/
document.addEventListener('keydown', evento => {
  if (evento.key === 'Escape') {
    cerrarCarrito();
    cerrarModal();
  }
});

/* 15. INICIALIZACIÓN*/
pintarCabecera();
pintarFiltros();
pintarProductos();
pintarCarrito();