

function ResultDisplay({ prediction }) {
  return (
    <div className="p-4 bg-green-100 shadow-md rounded-md mt-4 text-green-800">
      <h2 className="text-xl font-semibold mb-2">Possible Diseases</h2>
      <p>{prediction}</p>
    </div>
  );
}

export default ResultDisplay;
