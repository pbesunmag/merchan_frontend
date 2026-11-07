import PedidoCard from "./PedidoCard";

// Columna del tablero Kanban: título, contador y tarjetas de los pedidos de un estado.
export default function ColumnaKanban({
  titulo,
  tipo,
  pedidos,
  mensajeVacio,
  hayFiltrosActivos,
  ...accionesTarjeta
}) {
  return (
    <section className="columna">
      <div className="columna-titulo">
        <span className="columna-texto-titulo">{titulo}</span>
        <span className="columna-contador">{pedidos.length}</span>
      </div>

      <div className="pedidos-lista">
        {pedidos.length === 0 ? (
          <p className="vacio-texto">
            {hayFiltrosActivos
              ? "Sin resultados para los filtros aplicados"
              : mensajeVacio}
          </p>
        ) : (
          pedidos.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              tipo={tipo}
              {...accionesTarjeta}
            />
          ))
        )}
      </div>
    </section>
  );
}
