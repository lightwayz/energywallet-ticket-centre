"use client";

import { motion, MotionProps } from "framer-motion";
import React, { ComponentProps } from "react";


// Safely wrap motion components with clean typings
export const MDiv = motion.div as React.FC<ComponentProps<"div"> & MotionProps>;
export const MSection = motion.section as React.FC<
    ComponentProps<"section"> & MotionProps
>;
export const MButton = motion.button as React.FC<
    ComponentProps<"button"> & MotionProps
>;
