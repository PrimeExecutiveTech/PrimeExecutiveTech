// NOTE: Users of the `experimental` builds of React should add a reference
// to 'react/experimental' in their project. See experimental.d.ts's top comment
// for reference and documentation on how exactly to do it.

/// <reference path="global.d.ts" />

import * as CSS from "csstype";

type NativeAnimationEvent = AnimationEvent;
type NativeClipboardEvent = ClipboardEvent;
type NativeCompositionEvent = CompositionEvent;
type NativeDragEvent = DragEvent;
type NativeFocusEvent = FocusEvent;
type NativeInputEvent = InputEvent;
type NativeKeyboardEvent = KeyboardEvent;
type NativeMouseEvent = MouseEvent;
type NativeTouchEvent = TouchEvent;
type NativePointerEvent = PointerEvent;
type NativeToggleEvent = ToggleEvent;
type NativeTransitionEvent = TransitionEvent;
type NativeUIEvent = UIEvent;
type NativeWheelEvent = WheelEvent;

/**
 * Used to represent DOM API's where users can either pass
 * true or false as a boolean or as its equivalent strings.
 */
type Booleanish = boolean | "true" | "false";

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin MDN}
 */
type CrossOrigin = "anonymous" | "use-credentials" | "" | undefined;

declare const UNDEFINED_VOID_ONLY: unique symbol;

/**
 * @internal Use `Awaited<ReactNode>` instead
 */
// Helper type to enable `Awaited<ReactNode>`.
// Must be a copy of the non-thenables of `ReactNode`.
type AwaitedReactNode =
    | React.ReactElement
    | string
    | number
    | bigint
    | Iterable<React.ReactNode>
    | React.ReactPortal
    | boolean
    | null
    | undefined
    | React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_REACT_NODES[
        keyof React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_REACT_NODES
    ];

/**
 * The function returned from an effect passed to {@link React.useEffect useEffect},
 * which can be used to clean up the effect when the component unmounts.
 *
 * @see {@link https://react.dev/reference/react/useEffect React Docs}
 */
type Destructor = () => void | { [UNDEFINED_VOID_ONLY]: never };
type VoidOrUndefinedOnly = void | { [UNDEFINED_VOID_ONLY]: never };

// eslint-disable-next-line @definitelytyped/export-just-namespace
export = React;
export as namespace React;

declare namespace React {
    //
    // React Elements
    // ----------------------------------------------------------------------

    /**
     * Used to retrieve the possible components which accept a given set of props.
     *
     * Can be passed no type parameters to get a union of all possible components
     * and tags.
     *
     * Is a superset of {@link ComponentType}.
     *
     * @template P The props to match against. If not passed, defaults to any.
     * @template Tag An optional tag to match against. If not passed, attempts to match against all possible tags.
     *
     * @example
     *
     * ```tsx
     * // All components and tags (img, embed etc.)
     * // which accept `src`
     * type SrcComponents = ElementType<{ src: any }>;
     * ```
     *
     * @example
     *
     * ```tsx
     * // All components
     * type AllComponents = ElementType;
     * ```
     *
     * @example
     *
     * ```tsx
     * // All custom components which match `src`, and tags which
     * // match `src`, narrowed down to just `audio` and `embed`
     * type SrcComponents = ElementType<{ src: any }, 'audio' | 'embed'>;
     * ```
     */
    type ElementType<P = any, Tag extends keyof JSX.IntrinsicElements = keyof JSX.IntrinsicElements> =
        | { [K in Tag]: P extends JSX.IntrinsicElements[K] ? K : never }[Tag]
        | ComponentType<P>;

    /**
     * Represents any user-defined component, either as a function or a class.
     *
     * Similar to {@link JSXElementConstructor}, but with extra properties like
     * {@link FunctionComponent.defaultProps defaultProps }.
     *
     * @template P The props the component accepts.
     *
     * @see {@link ComponentClass}
     * @see {@link FunctionComponent}
     */
    type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;

    /**
     * Represents any user-defined component, either as a function or a class.
     *
     * Similar to {@link ComponentType}, but without extra properties like
     * {@link FunctionComponent.defaultProps defaultProps }.
     *
     * @template P The props the component accepts.
     */
    type JSXElementConstructor<P> =
        | ((
            props: P,
        ) => ReactElement<any, any> | null)
        // constructor signature must match React.Component
        | (new(props: P, context: any) => Component<any, any>);

    /**
     * Created by {@link createRef}, or {@link useRef} when passed `null`.
     *
     * @template T The type of the ref's value.
     *
     * @example
     *
     * ```tsx
     * const ref = createRef<HTMLDivElement>();
     *
     * ref.current = document.createElement('div'); // Error
     * ```
     */
    interface RefObject<T> {
        /**
         * The current value of the ref.
         */
        current: T;
    }

    interface DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES {
    }
    /**
     * A callback fired whenever the ref's value changes.
     *
     * @template T The type of the ref's value.
     *
     * @see {@link https://react.dev/reference/react-dom/components/common#ref-callback React Docs}
     *
     * @example
     *
     * ```tsx
     * <div ref={(node) => console.log(node)} />
     * ```
     */
    type RefCallback<T> = {
        bivarianceHack(
            instance: T | null,
        ):
            | void
            | (() => VoidOrUndefinedOnly)
            | DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[
                keyof DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES
            ];
    }["bivarianceHack"];

    /**
     * A union type of all possible shapes for React refs.
     *
     * @see {@link RefCallback}
     * @see {@link RefObject}
     */

    type Ref<T> = RefCallback<T> | RefObject<T | null> | null;
    /**
     * @deprecated Use `Ref` instead. String refs are no longer supported.
     * If you're typing a library with support for React versions with string refs, use `RefAttributes<T>['ref']` instead.
     */
    type LegacyRef<T> = Ref<T>;
    /**
     * @deprecated Use `ComponentRef<T>` instead
     *
     * Retrieves the type of the 'ref' prop for a given component type or tag name.
     *
     * @template C The component type.
     *
     * @example
     *
     * ```tsx
     * type MyComponentRef = React.ElementRef<typeof MyComponent>;
     * ```
     *
     * @example
     *
     * ```tsx
     * type DivRef = React.ElementRef<'div'>;
     * ```
     */
    type ElementRef<
        C extends
            | ForwardRefExoticComponent<any>
            | { new(props: any, context: any): Component<any> }
            | ((props: any) => ReactElement | null)
            | keyof JSX.IntrinsicElements,
    > = ComponentRef<C>;

    type ComponentState = any;

    /**
     * A value which uniquely identifies a node among items in an array.
     *
     * @see {@link https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key React Docs}
     */
    type Key = string | number | bigint;

    /**
     * @internal The props any component can receive.
     * You don't have to add this type. All components automatically accept these props.
     * ```tsx
     * const Component = () => <div />;
     * <Component key="one" />
     * ```
     *
     * WARNING: The implementation of a component will never have access to these attributes.
     * The following example would be incorrect usage because {@link Component} would never have access to `key`:
     * ```tsx
     * const Component = (props: React.Attributes) => props.key;
     * ```
     */
    interface Attributes {
        key?: Key | null | undefined;
    }
    /**
     * The props any component accepting refs can receive.
     * Class components, built-in browser components (e.g. `div`) and forwardRef components can receive refs and automatically accept these props.
     * ```tsx
     * const Component = forwardRef(() => <div />);
     * <Component ref={(current) => console.log(current)} />
     * ```
     *
     * You only need this type if you manually author the types of props that need to be compatible with legacy refs.
     * ```tsx
     * interface Props extends React.RefAttributes<HTMLDivElement> {}
     * declare const Component: React.FunctionComponent<Props>;
     * ```
     *
     * Otherwise it's simpler to directly use {@link Ref} since you can safely use the
     * props type to describe to props that a consumer can pass to the component
     * as well as describing the props the implementation of a component "sees".
     * {@link RefAttributes} is generally not safe to describe both consumer and seen props.
     *
     * ```tsx
     * interface Props extends {
     *   ref?: React.Ref<HTMLDivElement> | undefined;
     * }
     * declare const Component: React.FunctionComponent<Props>;
     * ```
     *
     * WARNING: The implementation of a component will not have access to the same type in versions of React supporting string refs.
     * The following example would be incorrect usage because {@link Component} would never have access to a `ref` with type `string`
     * ```tsx
     * const Component = (props: React.RefAttributes) => props.ref;
     * ```
     */
    interface RefAttributes<T> extends Attributes {
        /**
         * Allows getting a ref to the component instance.
         * Once the component unmounts, React will set `ref.current` to `null`
         * (or call the ref with `null` if you passed a callback ref).
         *
         * @see {@link https://react.dev/learn/referencing-values-with-refs#refs-and-the-dom React Docs}
         */
        ref?: Ref<T> | undefined;
    }

    /**
     * Represents the built-in attributes available to class components.
     */
    interface ClassAttributes<T> extends RefAttributes<T> {
    }

    /**
     * Represents a JSX element.
     *
     * Where {@link ReactNode} represents everything that can be rendered, `ReactElement`
     * only represents JSX.
     *
     * @template P The type of the props object
     * @template T The type of the component or tag
     *
     * @example
     *
     * ```tsx
     * const element: ReactElement = <div />;
     * ```
     */
    interface ReactElement<
        P = unknown,
        T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>,
    > {
        type: T;
        props: P;
        key: string | null;
    }

    /**
     * @deprecated
     */
    interface ReactComponentElement<
        T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>,
        P = Pick<ComponentProps<T>, Exclude<keyof ComponentProps<T>, "key" | "ref">>,
    > extends ReactElement<P, Exclude<T, number>> {}

    /**
     * @deprecated Use `ReactElement<P, React.FunctionComponent<P>>`
     */
    interface FunctionComponentElement<P> extends ReactElement<P, FunctionComponent<P>> {
        /**
         * @deprecated Use `element.props.ref` instead.
         */
        ref?: ("ref" extends keyof P ? P extends { ref?: infer R | undefined } ? R : never : never) | undefined;
    }

    /**
     * @deprecated Use `ReactElement<P, React.ComponentClass<P>>`
     */
    type CElement<P, T extends Component<P, ComponentState>> = ComponentElement<P, T>;
    /**
     * @deprecated Use `ReactElement<P, React.ComponentClass<P>>`
     */
    interface ComponentElement<P, T extends Component<P, ComponentState>> extends ReactElement<P, ComponentClass<P>> {
        /**
         * @deprecated Use `element.props.ref` instead.
         */
        ref?: Ref<T> | undefined;
    }

    /**
     * @deprecated Use {@link ComponentElement} instead.
     */
    type ClassicElement<P> = CElement<P, ClassicComponent<P, ComponentState>>;

    // string fallback for custom web-components
    /**
     * @deprecated Use `ReactElement<P, string>`
     */
    interface DOMElement<P extends HTMLAttributes<T> | SVGAttributes<T>, T extends Element>
        extends ReactElement<P, string>
    {
        /**
         * @deprecated Use `element.props.ref` instead.
         */
        ref: Ref<T>;
    }

    // ReactHTML for ReactHTMLElement
    interface ReactHTMLElement<T extends HTMLElement> extends DetailedReactHTMLElement<AllHTMLAttributes<T>, T> {}

    interface DetailedReactHTMLElement<P extends HTMLAttributes<T>, T extends HTMLElement> extends DOMElement<P, T> {
        type: HTMLElementType;
    }

    // ReactSVG for ReactSVGElement
    interface ReactSVGElement extends DOMElement<SVGAttributes<SVGElement>, SVGElement> {
        type: SVGElementType;
    }

    interface ReactPortal extends ReactElement {
        children: ReactNode;
    }

    /**
     * For internal usage only.
     * Different release channels declare additional types of ReactNode this particular release channel accepts.
     * App or library types should never augment this interface.
     */
    interface DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_REACT_NODES {}

    /**
     * Represents all of the things React can render.
     *
     * Where {@link ReactElement} only represents JSX, `ReactNode` represents everything that can be rendered.
     *
     * @see {@link https://react-typescript-cheatsheet.netlify.app/docs/react-types/reactnode/ React TypeScript Cheatsheet}
     *
     * @example
     *
     * ```tsx
     * // Typing children
     * type Props = { children: ReactNode }
     *
     * const Component = ({ children }: Props) => <div>{children}</div>
     *
     * <Component>hello</Component>
     * ```
     *
     * @example
     *
     * ```tsx
     * // Typing a custom element
     * type Props = { customElement: ReactNode }
     *
     * const Component = ({ customElement }: Props) => <div>{customElement}</div>
     *
     * <Component customElement={<div>hello</div>} />
     * ```
     */
    // non-thenables need to be kept in sync with AwaitedReactNode
    type ReactNode =
        | ReactElement
        | string
        | number
        | bigint
        | Iterable<ReactNode>
        | ReactPortal
        | boolean
        | null
        | undefined
        | DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_REACT_NODES[
            keyof DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_REACT_NODES
        ]
        | Promise<AwaitedReactNode>;

    //
    // Top Level API
    // ----------------------------------------------------------------------

    // DOM Elements
    // TODO: generalize this to everything in `keyof ReactHTML`, not just "input"
    function createElement(
        type: "input",
        props?: InputHTMLAttributes<HTMLInputElement> & ClassAttributes<HTMLInputElement> | null,
        ...children: ReactNode[]
    ): DetailedReactHTMLElement<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    function createElement<P extends HTMLAttributes<T>, T extends HTMLElement>(
        type: HTMLElementType,
        props?: ClassAttributes<T> & P | null,
        ...children: ReactNode[]
    ): DetailedReactHTMLElement<P, T>;
    function createElement<P extends SVGAttributes<T>, T extends SVGElement>(
        type: SVGElementType,
        props?: ClassAttributes<T> & P | null,
        ...children: ReactNode[]
    ): ReactSVGElement;
    function createElement<P extends DOMAttributes<T>, T extends Element>(
        type: string,
        props?: ClassAttributes<T> & P | null,
        ...children: ReactNode[]
    ): DOMElement<P, T>;

    // Custom components

    function createElement<P extends {}>(
        type: FunctionComponent<P>,
        props?: Attributes & P | null,
        ...children: ReactNode[]
    ): FunctionComponentElement<P>;
    function createElement<P extends {}, T extends Component<P, ComponentState>, C extends ComponentClass<P>>(
        type: ClassType<P, T, C>,
        props?: ClassAttributes<T> & P | null,
        ...children: ReactNode[]
    ): CElement<P, T>;
    function createElement<P extends {}>(
        type: FunctionComponent<P> | ComponentClass<P> | string,
        props?: Attributes & P | null,
        ...children: ReactNode[]
    ): ReactElement<P>;

    // DOM Elements
    // ReactHTMLElement
    function cloneElement<P extends HTMLAttributes<T>, T extends HTMLElement>(
        element: DetailedReactHTMLElement<P, T>,
        props?: P,
        ...children: ReactNode[]
    ): DetailedReactHTMLElement<P, T>;
    // ReactHTMLElement, less specific
    function cloneElement<P extends HTMLAttributes<T>, T extends HTMLElement>(
        element: ReactHTMLElement<T>,
        props?: P,
        ...children: ReactNode[]
    ): ReactHTMLElement<T>;
    // SVGElement
    function cloneElement<P extends SVGAttributes<T>, T extends SVGElement>(
        element: ReactSVGElement,
        props?: P,
        ...children: ReactNode[]
    ): ReactSVGElement;
    // DOM Element (has to be the last, because type checking stops at first overload that fits)
    function cloneElement<P extends DOMAttributes<T>, T extends Element>(
        element: DOMElement<P, T>,
        props?: DOMAttributes<T> & P,
        ...children: ReactNode[]
    ): DOMElement<P, T>;

    // Custom components
    function cloneElement<P>(
        element: FunctionComponentElement<P>,
        props?: Partial<P> & Attributes,
        ...children: ReactNode[]
    ): FunctionComponentElement<P>;
    function cloneElement<P, T extends Component<P, ComponentState>>(
        element: CElement<P, T>,
        props?: Partial<P> & ClassAttributes<T>,
        ...children: ReactNode[]
    ): CElement<P, T>;
    function cloneElement<P>(
        element: ReactElement<P>,
        props?: Partial<P> & Attributes,
        ...children: ReactNode[]
    ): ReactElement<P>;

    /**
     * Describes the props accepted by a Context {@link Provider}.
     *
     * @template T The type of the value the context provides.
     */
    interface ProviderProps<T> {
        value: T;
        children?: ReactNode | undefined;
    }

    /**
     * Describes the props accepted by a Context {@link Consumer}.
     *
     * @template T The type of the value the context provides.
     */
    interface ConsumerProps<T> {
        children: (value: T) => ReactNode;
    }

    /**
     * An object masquerading as a component. These are created by functions
     * like {@link forwardRef}, {@link memo}, and {@link createContext}.
     *
     * In order to make TypeScript work, we pretend that they are normal
     * components.
     *
     * But they are, in fact, not callable - instead, they are objects which
     * are treated specially by the renderer.
     *
     * @template P The props the component accepts.
     */
    interface ExoticComponent<P = {}> {
        (props: P): ReactElement | null;
        readonly $$typeof: symbol;
    }

    /**
     * An {@link ExoticComponent} with a `displayName` property applied to it.
     *
     * @template P The props the component accepts.
     */
    interface NamedExoticComponent<P = {}> extends ExoticComponent<P> {
        /**
         * Used in debugging messages. You might want to set it
         * explicitly if you want to display a different name for
         * debugging purposes.
         *
         * @see {@link https://legacy.reactjs.org/docs/react-component.html#displayname Legacy React Docs}
         */
        displayName?: string | undefined;
    }

    /**
     * An {@link ExoticComponent} with a `propTypes` property applied to it.
     *
     * @template P The props the component accepts.
     */
    interface ProviderExoticComponent<P> extends ExoticComponent<P> {
    }

    /**
     * Used to retrieve the type of a context object from a {@link Context}.
     *
     * @template C The context object.
     *
     * @example
     *
     * ```tsx
     * import { createContext } from 'react';
     *
     * const MyContext = createContext({ foo: 'bar' });
     *
     * type ContextType = ContextType<typeof MyContext>;
     * // ContextType = { foo: string }
     * ```
     */
    type ContextType<C extends Context<any>> = C extends Context<infer T> ? T : never;

    /**
     * Wraps your components to specify the value of this context for all components inside.
     *
     * @see {@link https://react.dev/reference/react/createContext#provider React Docs}
     *
     * @example
     *
     * ```tsx
     * import { createContext } from 'react';
     *
     * const ThemeContext = createContext('light');
     *
     * function App() {
     *   return (
     *     <ThemeContext.Provider value="dark">
     *       <Toolbar />
     *     </ThemeContext.Provider>
     *   );
     * }
     * ```
     */
    type Provider<T> = ProviderExoticComponent<ProviderProps<T>>;

    /**
     * The old way to read context, before {@link useContext} existed.
     *
     * @see {@link https://react.dev/reference/react/createContext#consumer React Docs}
     *
     * @example
     *
     * ```tsx
     * import { UserContext } from './user-context';
     *
     * function Avatar() {
     *   return (
     *     <UserContext.Consumer>
     *       {user => <img src={user.profileImage} alt={user.name} />}
     *     </UserContext.Consumer>
     *   );
     * }
     * ```
     */
    type Consumer<T> = ExoticComponent<ConsumerProps<T>>;

    /**
     * Context lets components pass information deep down without explicitly
     * passing props.
     *
     * Created from {@link createContext}
     *
     * @see {@link https://react.dev/learn/passing-data-deeply-with-context React Docs}
     * @see {@link https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context/ React TypeScript Cheatsheet}
     *
     * @example
     *
     * ```tsx
     * import { createContext } from 'react';
     *
     * const ThemeContext = createContext('light');
     * ```
     */
    interface Context<T> extends Provider<T> {
        Provider: Provider<T>;
        Consumer: Consumer<T>;
        /**
         * Used in debugging messages. You might want to set it
         * explicitly if you want to display a different name for
         * debugging purposes.
         *
         * @see {@link https://legacy.reactjs.org/docs/react-component.html#displayname Legacy React Docs}
         */
        displayName?: string | undefined;
    }

    /**
     * Lets you create a {@link Context} that components can provide or read.
     *
     * @param defaultValue The value you want the context to have when there is no matching
     * {@link Provider} in the tree above the component reading the context. This is meant
     * as a "last resort" fallback.
     *
     * @see {@link https://react.dev/reference/react/createContext#reference React Docs}
     * @see {@link https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context/ React TypeScript Cheatsheet}
     *
     * @example
     *
     * ```tsx
     * import { createContext } from 'react';
     *
     * const ThemeContext = createContext('light');
     * function App() {
     *   return (
     *     <ThemeContext value="dark">
     *       <Toolbar />
     *     </ThemeContext>
     *   );
     * }
     * ```
     */
    function createContext<T>(
        // If you thought this should be optional, see
        // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/24509#issuecomment-382213106
        defaultValue: T,
    ): Context<T>;

    function isValidElement<P>(object: {} | null | undefined): object is ReactElement<P>;

    const Children: {
        map<T, C>(
            children: C | readonly C[],
            fn: (child: C, index: number) => T,
        ): C extends null | undefined ? C : Array<Exclude<T, boolean | null | undefined>>;
        forEach<C>(children: C | readonly C[], fn: (child: C, index: number) => void): void;
        count(children: any): number;
        only<C>(children: C): C extends any[] ? never : C;
        toArray(children: ReactNode | ReactNode[]): Array<Exclude<ReactNode, boolean | null | undefined>>;
    };

    export interface FragmentProps {
        children?: React.ReactNode;
    }
    /**
     * Lets you group elements without a wrapper node.
     *
     * @see {@link https://react.dev/reference/react/Fragment React Docs}
     *
     * @example
     *
     * ```tsx
     * import { Fragment } from 'react';
     *
     * <Fragment>
     *   <td>Hello</td>
     *   <td>World</td>
     * </Fragment>
     * ```
     *
     * @example
     *
     * ```tsx
     * // Using the <></> shorthand syntax:
     *
     * <>
     *   <td>Hello</td>
     *   <td>World</td>
     * </>
     * ```
     */
    const Fragment: ExoticComponent<FragmentProps>;

    /**
     * Lets you find common bugs in your components early during development.
     *
     * @see {@link https://react.dev/reference/react/StrictMode React Docs}
     *
     * @example
     *
     * ```tsx
     * import { StrictMode } from 'react';
     *
     * <StrictMode>
     *   <App />
     * </StrictMode>
     * ```
     */
    const StrictMode: ExoticComponent<{ children?: ReactNode | undefined }>;

    /**
     * The props accepted by {@link Suspense}.
     *
     * @see {@link https://react.dev/reference/react/Suspense React Docs}
     */
    interface SuspenseProps {
        children?: ReactNode | undefined;

        /** A fallback react tree to show when a Suspense child (like React.lazy) suspends */
        fallback?: ReactNode;

        /**
         * A name for this Suspense boundary for instrumentation purposes.
         * The name will help identify this boundary in React DevTools.
         */
        name?: string | undefined;
    }

    /**
     * Lets you display a fallback until its children have finished loading.
     *
     * @see {@link https://react.dev/reference/react/Suspense React Docs}
     *
     * @example
     *
     * ```tsx
     * import { Suspense } from 'react';
     *
     * <Suspense fallback={<Loading />}>
     *   <ProfileDetails />
     * </Suspense>
     * ```
     */
    const Suspense: ExoticComponent<SuspenseProps>;
    const version: string;

    /**
     * The callback passed to {@link ProfilerProps.onRender}.
     *
     * @see {@link https://react.dev/reference/react/Profiler#onrender-callback React Docs}
     */
    type ProfilerOnRenderCallback = (
        /**
         * The string id prop of the {@link Profiler} tree that has just committed. This lets
         * you identify which part of the tree was committed if you are using multiple
         * profilers.
         *
         * @see {@link https://react.dev/reference/react/Profiler#onrender-callback React Docs}
         */
        id: string,
        /**
         * This lets you know whether the tree has just been mounted for the first time
         * or re-rendered due to a change in props, state, or hooks.
         *
         * @see {@link https://react.dev/reference/react/Profiler#onrender-callback React Docs}
         */
        phase: "mount" | "update" | "nested-update",
        /**
         * The number of milliseconds spent rendering the {@link Profiler} and its descendants
         * for the current update. This indicates how well the subtree makes use of
         * memoization (e.g. {@link memo} and {@link useMemo}). Ideally this value should decrease
         * significantly after the initial mount as many of the descendants will only need to
         * re-render if their specific props change.
         *
         * @see {@link https://react.dev/reference/react/Profiler#onrender-callback React Docs}
         */
        actualDuration: number,
        /**
         * The number of milliseconds estimating how much time it would take to re-render the entire
         * {@link Profiler} subtree without any optimizations. It is calculated by summing up the most
         * recent render durations of each component in the tree. This value estimates a worst-case
         * cost of rendering (e.g. the initial mount or a tree with no memoization). Compare
         * {@link actualDuration} against it to see if memoization is working.
         *
         * @see {@link https://react.dev/reference/react/Profiler#onrender-callback React Docs}
         */
        baseDuration: number,
        /**
         * A numeric timestamp for when React began rendering the current update.
         *
         * @see {@link https://react.dev/reference/react/Profiler#onrender-callback React Docs}
         */
        startTime: number,
        /**
         * A numeric timestamp for when React committed the current update. This value is shared
         * between all profilers in a commit, enabling them to be grouped if desirable.
         *
         * @see {@link https://react.dev/reference/react/Profiler#onrender-callback React Docs}
         */
        commitTime: number,
    ) => void;

    /**
     * The props accepted by {@link Profiler}.
     *
     * @see {@link https://react.dev/reference/react/Profiler React Docs}
     */
    interface ProfilerProps {
        children?: ReactNode | undefined;
        id: string;
        onRender: ProfilerOnRenderCallback;
    }

    /**
     * Lets you measure rendering performance of a React tree programmatically.
     *
     * @see {@link https://react.dev/reference/react/Profiler#onrender-callback React Docs}
     *
     * @example
     *
     * ```tsx
     * <Profiler id="App" onRender={onRender}>
     *   <App />
     * </Profiler>
     * ```
     */
    const Profiler: ExoticComponent<ProfilerProps>;

    //
    // Component API
    // ----------------------------------------------------------------------

    type ReactInstance = Component<any> | Element;

    // Base component for plain JS classes
    interface Component<P = {}, S = {}, SS = any> extends ComponentLifecycle<P, S, SS> {}
    class Component<P, S> {
        /**
         * If set, `this.context` will be set at runtime to the current value of the given Context.
         *
         * @example
         *
         * ```ts
         * type MyContext = number
         * const Ctx = React.createContext<MyContext>(0)
         *
         * class Foo extends React.Component {
         *   static contextType = Ctx
         *   context!: React.ContextType<typeof Ctx>
         *   render () {
         *     return <>My context's value: {this.context}</>;
         *   }
         * }
         * ```
         *
         * @see {@link https://react.dev/reference/react/Component#static-contexttype}
         */
        static contextType?: Context<any> | undefined;

        /**
         * Ignored by React.
         * @deprecated Only kept in types for backwards compatibility. Will be removed in a future major release.
         */
        static propTypes?: any;

        /**
         * If using React Context, re-declare this in your class to be the
         * `React.ContextType` of your `static contextType`.
         * Should be used with type annotation or static contextType.
         *
         * @example
         * ```ts
         * static contextType = MyContext
         * // For TS pre-3.7:
         * context!: React.ContextType<typeof MyContext>
         * // For TS 3.7 and above:
         * declare context: React.ContextType<typeof MyContext>
         * ```
         *
         * @see {@link https://react.dev/reference/react/Component#context React Docs}
         */
        context: unknown;

        // Keep in sync with constructor signature of JSXElementConstructor and ComponentClass.
        constructor(props: P);
        /**
         * @param props
         * @param context value of the parent {@link https://react.dev/reference/react/Component#context Context} specified
         * in `contextType`.
         */
        // TODO: Ideally we'd infer the constructor signatur from `contextType`.
        // Might be hard to ship without breaking existing code.
        constructor(props: P, context: any);

        // We MUST keep setState() as a unified signature because it allows proper checking of the method return type.
        // See: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/18365#issuecomment-351013257
        // Also, the ` | S` allows intellisense to not be dumbisense
        setState<K extends keyof S>(
            state: ((prevState: Readonly<S>, props: Readonly<P>) => Pick<S, K> | S | null) | (Pick<S, K> | S | null),
            callback?: () => void,
        ): void;

        forceUpdate(callback?: () => void): void;
        render(): ReactNode;

        readonly props: Readonly<P>;
        state: Readonly<S>;
    }

    class PureComponent<P = {}, S = {}, SS = any> extends Component<P, S, SS> {}

    /**
     * @deprecated Use `ClassicComponent` from `create-react-class`
     *
     * @see {@link https://legacy.reactjs.org/docs/react-without-es6.html Legacy React Docs}
     * @see {@link https://www.npmjs.com/package/create-react-class `create-react-class` on npm}
     */
    interface ClassicComponent<P = {}, S = {}> extends Component<P, S> {
        replaceState(nextState: S, callback?: () => void): void;
        isMounted(): boolean;
        getInitialState?(): S;
    }

    //
    // Class Interfaces
    // ----------------------------------------------------------------------

    /**
     * Represents the type of a function component. Can optionally
     * receive a type argument that represents the props the component
     * receives.
     *
     * @template P The props the component accepts.
     * @see {@link https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/function_components React TypeScript Cheatsheet}
     * @alias for {@link FunctionComponent}
     *
     * @example
     *
     * ```tsx
     * // With props:
     * type Props = { name: string }
     *
     * const MyComponent: FC<Props> = (props) => {
     *  return <div>{props.name}</div>
     * }
     * ```
     *
     * @example
     *
     * ```tsx
     * // Without props:
     * const MyComponentWithoutProps: FC = () => {
     *   return <div>MyComponentWithoutProps</div>
     * }
     * ```
     */
    type FC<P = {}> = FunctionComponent<P>;

    /**
     * Represents the type of a function component. Can optionally
     * receive a type argument that represents the props the component
     * accepts.
     *
     * @template P The props the component accepts.
     * @see {@link https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/function_components React TypeScript Cheatsheet}
     *
     * @example
     *
     * ```tsx
     * // With props:
     * type Props = { name: string }
     *
     * const MyComponent: FunctionComponent<Props> = (props) => {
     *  return <div>{props.name}</div>
     * }
     * ```
     *
     * @example
     *
     * ```tsx
     * // Without props:
     * const MyComponentWithoutProps: FunctionComponent = () => {
     *   return <div>MyComponentWithoutProps</div>
     * }
     * ```
     */
    interface FunctionComponent<P = {}> {
        (props: P): ReactElement<any, any> | null;
        /**
         * Ignored by React.
         * @deprecated Only kept in types for backwards compatibility. Will be removed in a future major release.
         */
        propTypes?: any;
        /**
         * Used in debugging messages. You might want to set it
         * explicitly if you want to display a different name for
         * debugging purposes.
         *
         * @see {@link https://legacy.reactjs.org/docs/react-component.html#displayname Legacy React Docs}
         *
         * @example
         *
         * ```tsx
         *
         * const MyComponent: FC = () => {
         *   return <div>Hello!</div>
         * }
         *
         * MyComponent.displayName = 'MyAwesomeComponent'
         * ```
         */
        displayName?: string | undefined;
    }

    /**
     * The type of the ref received by a {@link ForwardRefRenderFunction}.
     *
     * @see {@link ForwardRefRenderFunction}
     */
    type ForwardedRef<T> = ((instance: T | null) => void) | MutableRefObject<T | null> | null;

    /**
     * The type of the function passed to {@link forwardRef}. This is considered different
     * to a normal {@link FunctionComponent} because it receives an additional argument,
     *
     * @param props Props passed to the component, if any.
     * @param ref A ref forwarded to the component of type {@link ForwardedRef}.
     *
     * @template T The type of the forwarded ref.
     * @template P The type of the props the component accepts.
     *
     * @see {@link https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/forward_and_create_ref/ React TypeScript Cheatsheet}
     * @see {@link forwardRef}
     */
    interface ForwardRefRenderFunction<T, P = {}> {
        (props: P, ref: ForwardedRef<T>): ReactElement | null;
        /**
         * Used in debugging messages. You might want to set it
         * explicitly if you want to display a different name for
         * debugging purposes.
         *
         * Will show `ForwardRef(${Component.displayName || Component.name})`
         * in devtools by default, but can be given its own specific name.
         *
         * @see {@link https://legacy.reactjs.org/docs/react-component.html#displayname Legacy React Docs}
         */
        displayName?: string | undefined;
        /**
         * Ignored by React.
         * @deprecated Only kept in types for backwards compatibility. Will be removed in a future major release.
         */
        propTypes?: any;
    }

    /**
     * Represents a component class in React.
     *
     * @template P The props the component accepts.
     * @template S The internal state of the component.
     */
    interface ComponentClass<P = {}, S = ComponentState> extends StaticLifecycle<P, S> {
        // constructor signature must match React.Component
        new(
            props: P, /**
             * Value of the parent {@link https://react.dev/reference/react/Component#context Context} specified
             * in `contextType`.
             */
            context?: any,
        ): Component<P, S>;
        /**
         * Ignored by React.
         * @deprecated Only kept in types for backwards compatibility. Will be removed in a future major release.
         */
        propTypes?: any;
        contextType?: Context<any> | undefined;
        defaultProps?: Partial<P> | undefined;
        /**
         * Used in debugging messages. You might want to set it
         * explicitly if you want to display a different name for
         * debugging purposes.
         *
         * @see {@link https://legacy.reactjs.org/docs/react-component.html#displayname Legacy React Docs}
         */
        displayName?: string | undefined;
    }

    /**
     * @deprecated Use `ClassicComponentClass` from `create-react-class`
     *
     * @see {@link https://legacy.reactjs.org/docs/react-without-es6.html Legacy React Docs}
     * @see {@link https://www.npmjs.com/package/create-react-class `create-react-class` on npm}
     */
    interface ClassicComponentClass<P = {}> extends ComponentClass<P> {
        new(props: P): ClassicComponent<P, ComponentState>;
        getDefaultProps?(): P;
    }

    /**
     * Used in {@link createElement} and {@link createFactory} to represent
     * a class.
     *
     * An intersection type is used to infer multiple type parameters from
     * a single argument, which is useful for many top-level API defs.
     * See {@link https://github.com/Microsoft/TypeScript/issues/7234 this GitHub issue}
     * for more info.
     */
    type ClassType<P, T extends Component<P, ComponentState>, C extends ComponentClass<P>> =
        & C
        & (new(props: P, context: any) => T);

    //
    // Component Specs and Lifecycle
    // ----------------------------------------------------------------------

    // This should actually be something like `Lifecycle<P, S> | DeprecatedLifecycle<P, S>`,
    // as React will _not_ call the deprecated lifecycle methods if any of the new lifecycle
    // methods are present.
    interface ComponentLifecycle<P, S, SS = any> extends NewLifecycle<P, S, SS>, DeprecatedLifecycle<P, S> {
        /**
         * Called immediately after a component is mounted. Setting state here will trigger re-rendering.
         */
        componentDidMount?(): void;
        /**
         * Called to determine whether the change in props and state should trigger a re-render.
         *
         * `Component` always returns true.
         * `PureComponent` implements a shallow comparison on props and state and returns true if any
         * props or states have changed.
         *
         * If false is returned, {@link Component.render}, `componentWillUpdate`
         * and `componentDidUpdate` will not be called.
         */
        shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean;
        /**
         * Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
         * cancelled network requests, or cleaning up any DOM elements created in `componentDidMount`.
         */
        componentWillUnmount?(): void;
        /**
         * Catches exceptions generated in descendant components. Unhandled exceptions will cause
         * the entire component tree to unmount.
         */
        componentDidCatch?(error: Error, errorInfo: ErrorInfo): void;
    }

    // Unfortunately, we have no way of declaring that the component constructor must implement this
    interface StaticLifecycle<P, S> {
        getDerivedStateFromProps?: GetDerivedStateFromProps<P, S> | undefined;
        getDerivedStateFromError?: GetDerivedStateFromError<P, S> | undefined;
    }

    type GetDerivedStateFromProps<P, S> =
        /**
         * Returns an update to a component's state based on its new props and old state.
         *
         * Note: its presence prevents any of the deprecated lifecycle methods from being invoked
         */
        (nextProps: Readonly<P>, prevState: S) => Partial<S> | null;

    type GetDerivedStateFromError<P, S> =
        /**
         * This lifecycle is invoked after an error has been thrown by a descendant component.
         * It receives the error that was thrown as a parameter and should return a value to update state.
         *
         * Note: its presence prevents any of the deprecated lifecycle methods from being invoked
         */
        (error: any) => Partial<S> | null;

    // This should be "infer SS" but can't use it yet
    interface NewLifecycle<P, S, SS> {
        /**
         * Runs before React applies the result of {@link Component.render render} to the document, and
         * returns an object to be given to {@link componentDidUpdate}. Useful for saving
         * things such as scroll position before {@link Component.render render} causes changes to it.
         *
         * Note: the presence of this method prevents any of the deprecated
         * lifecycle events from running.
         */
        getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): SS | null;
        /**
         * Called immediately after updating occurs. Not called for the initial render.
         *
         * The snapshot is only present if {@link getSnapshotBeforeUpdate} is present and returns non-null.
         */
        componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void;
    }

    interface DeprecatedLifecycle<P, S> {
        /**
         * Called immediately before mounting occurs, and before {@link Component.render}.
         * Avoid introducing any side-effects or subscriptions in this method.
         *
         * Note: the presence of {@link NewLifecycle.getSnapshotBeforeUpdate getSnapshotBeforeUpdate}
         * or {@link StaticLifecycle.getDerivedStateFromProps getDerivedStateFromProps} prevents
         * this from being invoked.
         *
         * @deprecated 16.3, use {@link ComponentLifecycle.componentDidMount componentDidMount} or the constructor instead; will stop working in React 17
         * @see {@link https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state}
         * @see {@link https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path}
         */
        componentWillMount?(): void;
        /**
         * Called immediately before mounting occurs, and before {@link Component.render}.
         * Avoid introducing any side-effects or subscriptions in this method.
         *
         * This method will not stop working in React 17.
         *
         * Note: the presence of {@link NewLifecycle.getSnapshotBeforeUpdate getSnapshotBeforeUpdate}
         * or {@link StaticLifecycle.getDerivedStateFromProps getDerivedStateFromProps} prevents
         * this from being invoked.
         *
         * @deprecated 16.3, use {@link ComponentLifecycle.componentDidMount componentDidMount} or the constructor instead
         * @see {@link https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state}
         * @see {@link https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path}
         */
        UNSAFE_componentWillMount?(): void;
        /**
         * Called when the component may be receiving new props.
         * React may call this even if props have not changed, so be sure to compare new and existing
         * props if you only want to handle changes.
         *
         * Calling {@link Component.setState} generally does not trigger this method.
         *
         * Note: the presence of {@link NewLifecycle.getSnapshotBeforeUpdate getSnapshotBeforeUpdate}
         * or {@link StaticLifecycle.getDerivedStateFromProps getDerivedStateFromProps} prevents
         * this from being invoked.
         *
         * @deprecated 16.3, use static {@link StaticLifecycle.getDerivedStateFromProps getDerivedStateFromProps} instead; will stop working in React 17
         * @see {@link https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props}
         * @see {@link https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path}
         */
        componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;
        /**
         * Called when the component may be receiving new props.
         * React may call this even if props have not changed, so be sure to compare new and existing
         * props if you only want to handle changes.
         *
         * Calling {@link Component.setState} generally does not trigger this method.
         *
         * This method will not stop working in React 17.
         *
         * Note: the presence of {@link NewLifecycle.getSnapshotBeforeUpdate getSnapshotBeforeUpdate}
         * or {@link StaticLifecycle.getDerivedStateFromProps getDerivedStateFromProps} prevents
         * this from being invoked.
         *
         * @deprecated 16.3, use static {@link StaticLifecycle.getDerivedStateFromProps getDerivedStateFromProps} instead
         * @see {@link https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props}
         * @see {@link https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path}
         */
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;
        /**
         * Called immediately before rendering when new props or state is received. Not called for the initial render.
         *
         * Note: You cannot call {@link Component.setState} here.
         *
         * Note: the presence of {@link NewLifecycle.getSnapshotBeforeUpdate getSnapshotBeforeUpdate}
         * or {@link StaticLifecycle.getDerivedStateFromProps getDerivedStateFromProps} prevents
         * this from being invoked.
         *
         * @deprecated 16.3, use getSnapshotBeforeUpdate instead; will stop working in React 17
         * @see {@link https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update}
         * @see {@link https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path}
         */
        componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void;
        /**
         * Called immediately before rendering when new props or state is received. Not called for the initial render.
         *
         * Note: You cannot call {@link Component.setState} here.
         *
         * This method will not stop working in React 17.
         *
         * Note: the presence of {@link NewLifecycle.getSnapshotBeforeUpdate getSnapshotBeforeUpdate}
         * or {@link StaticLifecycle.getDerivedStateFromProps getDerivedStateFromProps} prevents
         * this from being invoked.
         *
         * @deprecated 16.3, use getSnapshotBeforeUpdate instead
         * @see {@link https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update}
         * @see {@link https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path}
         */
        UNSAFE_componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void;
    }

    function createRef<T>(): RefObject<T | null>;

    /**
     * The type of the component returned from {@link forwardRef}.
     *
     * @template P The props the component accepts, if any.
     *
     * @see {@link ExoticComponent}
     */
    interface ForwardRefExoticComponent<P> extends NamedExoticComponent<P> {
        /**
         * Ignored by React.
         * @deprecated Only kept in types for backwards compatibility. Will be removed in a future major release.
         */
        propTypes?: any;
    }

    /**
     * Lets your component expose a DOM node to a parent component
     * using a ref.
     *
     * @see {@link https://react.dev/reference/react/forwardRef React Docs}
     * @see {@link https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/forward_and_create_ref/ React TypeScript Cheatsheet}
     *
     * @param render See the {@link ForwardRefRenderFunction}.
     *
     * @template T The type of the DOM node.
     * @template P The props the component accepts, if any.
     *
     * @example
     *
     * ```tsx
     * interface Props {
     *   children?: ReactNode;
     *   type: "submit" | "button";
     * }
     *
     * export const FancyButton = forwardRef<HTMLButtonElement, Props>((props, ref) => (
     *   <button ref={ref} className="MyClassName" type={props.type}>
     *     {props.children}
     *   </button>
     * ));
     * ```
     */
    function forwardRef<T, P = {}>(
        render: ForwardRefRenderFunction<T, PropsWithoutRef<P>>,
    ): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;

    /**
     * Omits the 'ref' attribute from the given props object.
     *
     * @template Props The props object type.
     */
    type PropsWithoutRef<Props> =
        // Omit would not be sufficient for this. We'd like to avoid unnecessary mapping and need a distributive conditional to support unions.
        // see: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
        // https://github.com/Microsoft/TypeScript/issues/28339
        Props extends any ? ("ref" extends keyof Props ? Omit<Props, "ref"> : Props) : Props;
    /**
     * Ensures that the props do not include string ref, which cannot be forwarded
     * @deprecated Use `Props` directly. `PropsWithRef<Props>` is just an alias for `Props`
     */
    type PropsWithRef<Props> = Props;

    type PropsWithChildren<P = unknown> = P & { children?: ReactNode | undefined };

    /**
     * Used to retrieve the props a component accepts. Can either be passed a string,
     * indicating a DOM element (e.g. 'div', 'span', etc.) or the type of a React
     * component.
     *
     * It's usually better to use {@link ComponentPropsWithRef} or {@link ComponentPropsWithoutRef}
     * instead of this type, as they let you be explicit about whether or not to include
     * the `ref` prop.
     *
     * @see {@link https://react-typescript-cheatsheet.netlify.app/docs/react-types/componentprops/ React TypeScript Cheatsheet}
     *
     * @example
     *
     * ```tsx
     * // Retrieves the props an 'input' element accepts
     * type InputProps = React.ComponentProps<'input'>;
     * ```
     *
     * @example
     *
     * ```tsx
     * const MyComponent = (props: { foo: number, bar: string }) => <div />;
     *
     * // Retrieves the props 'MyComponent' accepts
     * type MyComponentProps = React.ComponentProps<typeof MyComponent>;
     * ```
     */
    type ComponentProps<T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>> = T extends
        JSXElementConstructor<infer Props> ? Props
        : T extends keyof JSX.IntrinsicElements ? JSX.IntrinsicElements[T]
        : {};

    /**
     * Used to retrieve the props a component accepts with its ref. Can either be
     * passed a string, indicating a DOM element (e.g. 'div', 'span', etc.) or the
     * type of a React component.
     *
     * @see {@link https://react-typescript-cheatsheet.netlify.app/docs/react-types/componentprops/ React TypeScript Cheatsheet}
     *
     * @example
     *
     * ```tsx
     * // Retrieves the props an 'input' element accepts
     * type InputProps = React.ComponentPropsWithRef<'input'>;
     * ```
     *
     * @example
     *
     * ```tsx
     * const MyComponent = (props: { foo: number, bar: string }) => <div />;
     *
     * // Retrieves the props 'MyComponent' accepts
     * type MyComponentPropsWithRef = React.ComponentPropsWithRef<typeof MyComponent>;
     * ```
     */
    type ComponentPropsWithRef<T extends ElementType> = T extends JSXElementConstructor<infer Props>
        // If it's a class i.e. newable we're dealing with a class component
        ? T extends abstract new(args: any) => any ? PropsWithoutRef<Props> & RefAttributes<InstanceType<T>>
        : Props
        : ComponentProps<T>;
    /**
     * Used to retrieve the props a custom component accepts with its ref.
     *
     * Unlike {@link ComponentPropsWithRef}, this only works with custom
     * components, i.e. components you define yourself. This is to improve
     * type-checking performance.
     *
     * @example
     *
     * ```tsx
     * const MyComponent = (props: { foo: number, bar: string }) => <div />;
     *
     * // Retrieves the props 'MyComponent' accepts
     * type MyComponentPropsWithRef = React.CustomComponentPropsWithRef<typeof MyComponent>;
     * ```
     */
    type CustomComponentPropsWithRef<T extends ComponentType> = T extends JSXElementConstructor<infer Props>
        // If it's a class i.e. newable we're dealing with a class component
        ? T extends abstract new(args: any) => any ? PropsWithoutRef<Props> & RefAttributes<InstanceType<T>>
        : Props
        : never;

    /**
     * Used to retrieve the props a component accepts without its ref. Can either be
     * passed a string, indicating a DOM element (e.g. 'div', 'span', etc.) or the
     * type of a React component.
     *
     * @see {@link https://react-typescript-cheatsheet.netlify.app/docs/react-types/componentprops/ React TypeScript Cheatsheet}
     *
     * @example
     *
     * ```tsx
     * // Retrieves the props an 'input' element accepts
     * type InputProps = React.ComponentPropsWithoutRef<'input'>;
     * ```
     *
     * @example
     *
     * ```tsx
     * const MyComponent = (props: { foo: number, bar: string }) => <div />;
     *
     * // Retrieves the props 'MyComponent' accepts
     * type MyComponentPropsWithoutRef = React.ComponentPropsWithoutRef<typeof MyComponent>;
     * ```
     */
    type ComponentPropsWithoutRef<T extends ElementType> = PropsWithoutRef<ComponentProps<T>>;

    /**
     * Retrieves the type of the 'ref' prop for a given component type or tag name.
     *
     * @template C The component type.
     *
     * @example
     *
     * ```tsx
     * type MyComponentRef = React.ComponentRef<typeof MyComponent>;
     * ```
     *
     * @example
     *
     * ```tsx
     * type DivRef = React.ComponentRef<'div'>;
     * ```
     */
    type ComponentRef<T extends ElementType> = ComponentPropsWithRef<T> extends RefAttributes<infer Method> ? Method
        : never;

    // will show `Memo(${Component.displayName || Component.name})` in devtools by default,
    // but can be given its own specific name
    type MemoExoticComponent<T extends ComponentType<any>> = NamedExoticComponent<CustomComponentPropsWithRef<T>> & {
        readonly type: T;
    };

    /**
     * Lets you skip re-rendering a component when its props are unchanged.
     *
     * @see {@link https://react.dev/reference/react/memo React Docs}
     *
     * @param Component The component to memoize.
     * @param propsAreEqual A function that will be used to determine if the props have changed.
     *
     * @example
     *
     * ```tsx
     * import { memo } from 'react';
     *
     * const SomeComponent = memo(function SomeComponent(props: { foo: string }) {
     *   // ...
     * });
     * ```
     */
    function memo<P extends object>(
        Component: FunctionComponent<P>,
        propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean,
    ): NamedExoticComponent<P>;
    function memo<T extends ComponentType<any>>(
        Component: T,
        propsAreEqual?: (prevProps: Readonly<ComponentProps<T>>, nextProps: Readonly<ComponentProps<T>>) => boolean,
    ): MemoExoticComponent<T>;

    interface LazyExoticComponent<T extends ComponentType<any>>
        extends ExoticComponent<CustomComponentPropsWithRef<T>>
    {
        readonly _result: T;
    }

    /**
     * Lets you defer loading a component’s code until it is rendered for the first time.
     *
     * @see {@link https://react.dev/reference/react/lazy React Docs}
     *
     * @param load A function that returns a `Promise` or another thenable (a `Promise`-like object with a
     * then method). React will not call `load` until the first time you attempt to render the returned
     * component. After React first calls load, it will wait for it to resolve, and then render the
     * resolved value’s `.default` as a React component. Both the returned `Promise` and the `Promise`’s
     * resolved value will be cached, so React will not call load more than once. If the `Promise` rejects,
     * React will throw the rejection reason for the nearest Error Boundary to handle.
     *
     * @example
     *
     * ```tsx
     * import { lazy } from 'react';
     *
     * const MarkdownPreview = lazy(() => import('./MarkdownPreview.js'));
     * ```
     */
    function lazy<T extends ComponentType<any>>(
        load: () => Promise<{ default: T }>,
    ): LazyExoticComponent<T>;

    //
    // React Hooks
    // ----------------------------------------------------------------------

    /**
     * The instruction passed to a {@link Dispatch} function in {@link useState}
     * to tell React w