
import Navbar from "./components/Navbar";
import Projects from "./components/Projects";
import Footer from "./components/Footer";

export default function AllProjects() {
  return (
    <>
      <Navbar />

      <main className="all-projects-page">
        <section className="all-projects-hero">
          <span className="all-projects-eyebrow">
            MY WORK & EXPERIENCE
          </span>

          <h1>
            Explore My <span>Projects</span>
          </h1>

          <p>
            A collection of projects showcasing my skills in web
            development, creative problem-solving, and building
            meaningful digital experiences.
          </p>
        </section>

        <Projects showAll={true} />
      </main>

      <Footer />
    </>
  );
}
