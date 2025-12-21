"use client";

import { Button } from "@pointwise/app/components/ui/Button";
import { Card } from "@pointwise/app/components/ui/Card";
import Container from "@pointwise/app/components/ui/Container";
import { ErrorCard } from "@pointwise/app/components/ui/ErrorCard";
import Grid from "@pointwise/app/components/ui/Grid";
import ModalV2 from "@pointwise/app/components/ui/modalV2";
import { useGetProjectsQuery } from "@pointwise/lib/redux/services/projectsApi";
import CreateProjectModal from "../modals/project/CreateProjectModal";
import ProjectCardV2 from "../projectCard/ProjectCardV2";
import NoProjectsView from "./NoProjectsView";

export default function ProjectsOverviewV2() {
  const { data: projects, isLoading, isError, refetch } = useGetProjectsQuery();

  const hasProjects =
    !isError &&
    !isLoading &&
    projects?.projects &&
    projects.projects.length > 0;
  const isEmpty =
    !isError &&
    !isLoading &&
    projects?.projects &&
    projects.projects.length === 0;

  return (
    <>
      <CreateProjectModal />
      <Container direction="vertical" gap="sm" className="pt-3">
        <Container>
          <Card
            title="Projects"
            label="Overview"
            loading={isLoading}
            className="flex-1"
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => ModalV2.Manager.open("create-project-modal")}
              >
                Create Project
              </Button>
            }
          >
            <ErrorCard
              display={isError}
              message="Projects could not be loaded"
              onRetry={refetch}
              className="mb-6"
            />
            {hasProjects ? (
              <Grid columns={{ default: 1, md: 2, lg: 3 }} gap="md">
                {projects.projects.map((project) => (
                  <ProjectCardV2 key={project.id} project={project} />
                ))}
              </Grid>
            ) : isEmpty ? (
              <NoProjectsView
                onCreateClick={() =>
                  ModalV2.Manager.open("create-project-modal")
                }
              />
            ) : null}
          </Card>
        </Container>
      </Container>
    </>
  );
}
