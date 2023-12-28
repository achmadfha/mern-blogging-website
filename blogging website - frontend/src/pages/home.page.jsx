import AnimationWrapper from "../common/page-animation.jsx";
import InPageNavigation from "../components/inpage-navigation.component.jsx"

const HomePage = () => {
  return (
      <AnimationWrapper>
          <section className="h-cover flex justify-center gap-10">
              <div className="w-full">
                  <InPageNavigation route={["home", "trending blogs"]}>

                  </InPageNavigation>
              </div>

              <div>

              </div>
          </section>
      </AnimationWrapper>
  )
}

export default HomePage;