import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import ReturnPolicy from "./ReturnPolicy";

test("ReturnPolicy Component", () => {
  
  
    render(<ReturnPolicy />);

    // Check if the Return Policy heading is rendered
    const heading = screen.getByText(/return policy/i);
    expect(heading).toBeInTheDocument();
  });

 