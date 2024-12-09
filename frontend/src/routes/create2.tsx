import {createFileRoute} from '@tanstack/react-router';
import CreateRoom2 from '../pages/CreateRoom2';

export const Create2Route = createFileRoute('/create2')({
    component: CreateRoom2,
});

export const Route = Create2Route;

