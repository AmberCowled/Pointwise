'use client';

import Page from "@pointwise/app/components/general/Page";
import NavbarV2 from "@pointwise/app/dashboardV2/navbarV2/NavbarV2";
import { useGetProjectsQuery } from "@pointwise/lib/redux/services/projectsApi";

export default function DashboardPage() {
  const { data: projects, isLoading: loadingProjects, isError: errorProjects } = useGetProjectsQuery();
  
  return (
    <Page>
      <NavbarV2 initials="AB" />
      <div className="flex items-center text-align-center">
        {loadingProjects && <div>Loading projects...</div>}
        {errorProjects && <div>Error loading projects...</div>}
        {!loadingProjects && !errorProjects && projects?.projects.map((project) => (
          <div key={project.id}>
            <h2>Name: {project.name}</h2>
            <p>Description: {project.description}</p>
            <p>Visibility: {project.visibility}</p>
          </div>
        ))}
      </div>
    </Page>
  );
}