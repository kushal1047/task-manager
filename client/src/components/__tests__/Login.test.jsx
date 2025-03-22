import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../Login";
import { loginUser } from "../../api";
import { BrowserRouter } from "react-router";

// Mock dependencies
jest.mock("../../api", () => ({
  loginUser: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: () => mockNavigate,
}));

describe("Login component", () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setup = () => {
    return render(
      <BrowserRouter>
        <Login onLogin={mockOnLogin} />
      </BrowserRouter>
    );
  };

  it("renders form inputs and login button", () => {
    setup();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("updates input fields on change", () => {
    setup();
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(usernameInput.value).toBe("testuser");
    expect(passwordInput.value).toBe("password123");
  });

  it("calls loginUser and navigates on successful login", async () => {
    const mockUser = { firstName: "Jane" };
    const mockToken = "mockToken123";
    loginUser.mockResolvedValueOnce({ token: mockToken, user: mockUser });

    setup();

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "janedoe" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() =>
      expect(loginUser).toHaveBeenCalledWith({
        username: "janedoe",
        password: "password123",
      })
    );

    expect(localStorage.getItem("token")).toBe(mockToken);
    expect(localStorage.getItem("name")).toBe("Jane");

    await waitFor(() => expect(mockOnLogin).toHaveBeenCalled());

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/"));
  });

  it("handles login errors gracefully", async () => {
    loginUser.mockRejectedValueOnce(new Error("Invalid credentials"));

    setup();

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "wronguser" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(loginUser).toHaveBeenCalled());

    await waitFor(() => expect(mockOnLogin).not.toHaveBeenCalled());

    await waitFor(() => expect(mockNavigate).not.toHaveBeenCalled());
  });
});
