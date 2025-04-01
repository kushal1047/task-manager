import { render, screen } from "@testing-library/react";
import TaskList from "../TaskList";

const sampleTasks = [
  { _id: "1", title: "First task", completed: false },
  { _id: "2", title: "Second task", completed: true },
];

describe("TaskList", () => {
  it("renders fallback when empty", () => {
    render(<TaskList tasks={[]} onToggle={() => {}} onDelete={() => {}} />);
    expect(
      screen.getByText(/no tasks yet\. you're free as a bird/i)
    ).toBeInTheDocument();
  });

  it("renders a list of tasks", () => {
    render(
      <TaskList tasks={sampleTasks} onToggle={() => {}} onDelete={() => {}} />
    );

    expect(screen.getByText("First task")).toBeInTheDocument();
    expect(screen.getByText("Second task")).toBeInTheDocument();
  });
});
