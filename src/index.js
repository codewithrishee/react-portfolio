function App(){
  const projectName = "Mini Eco";
  const hasGithub = true;

  return (
    <div>
      <h2>{projectName}</h2>
      {hasGithub ? (<h3>GitHub Available</h3>) : (<h3>GitHub not Available </h3>)}
      {hasGithub && <button>view project</button>}
    </div>
  );
}
    export default App;