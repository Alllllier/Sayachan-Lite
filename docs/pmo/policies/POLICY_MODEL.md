# Policy Model

`Sayachan PMO v2` 中的 policy 用来承载横向规则。

这里的规则不属于单一 state 文件，也不只属于某一个 protocol。

## 当前使用标准

一条规则更适合进入 policy，当它满足下面至少一部分特征：

- 跨多个流程都成立
- 会影响多个 state 文件的使用方式
- 如果不单独写出来，就会反复混进 workflow、manual、baseline 或 guide
- 它回答的是“什么情况下应该这样判断”，而不是“流程下一步是什么”

## 当前第一批 policy

- `decision-capture-policy.md`
