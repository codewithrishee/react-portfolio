import Navbar from "./components/Navbar";
import Projects from "./components/Projects";
import Footer from "./components/Footer";

export default function AllProjects() {
  return (
    <>
      <Navbar />

      <main className="all-projects-page">
        <Projects showAll={true} />
      </main>

      <Footer />
    </>
  );
}