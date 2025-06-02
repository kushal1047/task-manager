export default function SubtaskProgressBar({ show, percent }) {
  if (!show) return null;
  return (
    <div className="w-full h-0.5 mb-2 bg-gray-200 rounded-full overflow-hidden relative">
      <div
        className="h-full bg-green-500 transition-all duration-300 absolute left-0 top-0"
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  );
}
