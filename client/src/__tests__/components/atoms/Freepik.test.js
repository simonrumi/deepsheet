import React from 'react';
import Freepik from '../../../components/atoms/Freepik';
import { render, screen } from '../../../testUtils';
import '@testing-library/jest-dom';

describe('Freepik', () => {
    it('renders and displays the flaticon url', () => {
        render(<Freepik />);
        expect(screen.queryByText(/www\.flaticon\.com/i)).toBeInTheDocument();
    });
})