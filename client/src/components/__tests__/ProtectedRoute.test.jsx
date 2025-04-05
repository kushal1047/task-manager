import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import ProtectedRoute from "../ProtectedRoute";
import TaskView from "../TaskView";

describe("ProtectedRoute", () => {
  const mockProps = {
    tasks: [],
    handleAdd: jest.fn(),
    handleToggle: jest.fn(),
    handleDelete: jest.fn(),
  };

  it("redirects when isValid is false", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/"
            element={
              <ProtectedRoute isValid={false}>
                <TaskView {...mockProps} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders TaskView when isValid is true", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute isValid={true}>
                <TaskView {...mockProps} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Get It Done/i)).toBeInTheDocument();
  });

  it("renders loading while isValid is null", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute isValid={null}>
                <TaskView {...mockProps} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
