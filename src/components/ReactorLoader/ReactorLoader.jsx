import './ReactorLoader.css';

export default function ReactorLoader({ size = 120, text = "Cargando..." }) {
  return (
    <div className="arc-loader-container">
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className="arc-reactor-svg"
      >
        <defs>
          <filter id="arc-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur1" />
            <feGaussianBlur stdDeviation="14" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="#111827"
          strokeWidth="10"
        />

        <circle
          cx="100"
          cy="100"
          r="82"
          fill="none"
          stroke="#00e5ff"
          strokeWidth="3"
          filter="url(#arc-glow)"
          opacity="0.8"
        />

        <g className="arc-coils-spin">
          {[...Array(10)].map((_, i) => (
            <rect
              key={i}
              x="93"
              y="18"
              width="14"
              height="24"
              rx="3"
              fill="#00e5ff"
              opacity="0.85"
              transform={`rotate(${i * 36} 100 100)`}
              filter="url(#arc-glow)"
            />
          ))}
        </g>

        <circle
          cx="100"
          cy="100"
          r="54"
          fill="none"
          stroke="#0284c7"
          strokeWidth="5"
          opacity="0.6"
        />

        <circle
          cx="100"
          cy="100"
          r="36"
          fill="#001824"
          stroke="#00e5ff"
          strokeWidth="4"
          className="arc-core-pulse"
          filter="url(#arc-glow)"
        />

        <circle
          cx="100"
          cy="100"
          r="16"
          fill="#ffffff"
          filter="url(#arc-glow)"
          className="arc-core-pulse"
        />
      </svg>

      {text && <p className="arc-loader-text">{text}</p>}
    </div>
  );
}