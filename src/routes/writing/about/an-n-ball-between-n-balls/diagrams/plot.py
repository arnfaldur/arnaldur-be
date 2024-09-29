import sympy
from sympy.abc import D
import matplotlib.pyplot as plt

expr = ((sympy.sqrt(D) - 1) / 4) ** D * sympy.pi ** (D / 2) / sympy.gamma(D / 2 + 1)

x = range(0,1401)
y = [float(expr.subs(D, i)) for i in x]

plt.plot(x,y)
plt.yscale("log")
plt.xlabel("D")
plt.ylabel("Volume")
plt.grid()
plt.show()
