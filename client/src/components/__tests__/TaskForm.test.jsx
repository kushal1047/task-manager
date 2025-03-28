import { render, screen, fireEvent } from "@testing-library/react";
import TaskForm from "../TaskForm";

describe("TaskForm component", () => {
  it("renders input and button", () => {
    render(<TaskForm onAdd={() => {}} />);
    expect(screen.getByPlaceholderText(/add a new task/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
  });

  it("updates input value when typed", () => {
    render(<TaskForm onAdd={() => {}} />);
    const input = screen.getByPlaceholderText(/add a new task/i);
    fireEvent.change(input, { target: { value: "Test task" } });
    expect(input.value).toBe("Test task");
  });

  it("calls onAdd with input value and clears input", () => {
    const onAddMock = jest.fn();
    render(<TaskForm onAdd={onAddMock} />);
    const input = screen.getByPlaceholderText(/add a new task/i);
    const button = screen.getByRole("button", { name: /add/i });

    fireEvent.change(input, { target: { value: "Buy milk" } });
    fireEvent.click(button);

    expect(onAddMock).toHaveBeenCalledWith("Buy milk");
    expect(input.value).toBe(""); // input should be cleared
  });
});
